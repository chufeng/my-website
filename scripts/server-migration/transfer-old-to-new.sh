#!/usr/bin/env bash
set -euo pipefail

OLD_HOST="${OLD_HOST:-106.54.34.190}"
OLD_USER="${OLD_USER:-root}"
NEW_HOST="${NEW_HOST:-36.151.143.238}"
NEW_USER="${NEW_USER:-root}"

SOURCE_PATH="${1:-/root/astrbot/data/astrbot/backups/astrbot_backup_20260429_154519.zip}"
DEST_DIR="${2:-/root/server-transfers}"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
NEW_KEY="${NEW_KEY:-$REPO_ROOT/.secrets/ssh/京东云控制台 codex_te.pem}"
TEMP_KEY="/tmp/codex_server_transfer_ed25519"
MARKER="codex-temp-server-transfer"

if ! command -v expect >/dev/null 2>&1; then
  echo "expect is required on the local machine." >&2
  exit 1
fi

if [[ ! -f "$NEW_KEY" ]]; then
  echo "New server key not found: $NEW_KEY" >&2
  exit 1
fi

read -rsp "Old server password for ${OLD_USER}@${OLD_HOST}: " OLD_PASSWORD
echo

run_old() {
  local remote_cmd="$1"
  OLD_PASSWORD="$OLD_PASSWORD" expect <<'EXPECT_EOF'
set timeout -1
set password $env(OLD_PASSWORD)
set host $env(OLD_HOST)
set user $env(OLD_USER)
set cmd $env(REMOTE_CMD)
spawn ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=accept-new -o PreferredAuthentications=password -o PubkeyAuthentication=no -o NumberOfPasswordPrompts=1 "$user@$host" "$cmd"
expect {
  -re "(?i)password:" { send "$password\r"; exp_continue }
  eof
}
catch wait result
exit [lindex $result 3]
EXPECT_EOF
}

export OLD_HOST OLD_USER

echo "Preparing temporary key on old server..."
export REMOTE_CMD="rm -f '$TEMP_KEY' '$TEMP_KEY.pub' && ssh-keygen -t ed25519 -N '' -f '$TEMP_KEY' >/dev/null && cat '$TEMP_KEY.pub'"
PUBKEY="$(run_old "$REMOTE_CMD" | awk '/^ssh-ed25519 / {print; exit}')"
if [[ -z "$PUBKEY" ]]; then
  echo "Failed to generate temporary key on old server." >&2
  exit 1
fi

cleanup() {
  set +e
  echo "Cleaning temporary credentials..."
  export REMOTE_CMD="rm -f '$TEMP_KEY' '$TEMP_KEY.pub'"
  run_old "$REMOTE_CMD" >/dev/null 2>&1
  ssh -i "$NEW_KEY" -o BatchMode=yes -o ConnectTimeout=10 -o StrictHostKeyChecking=accept-new "$NEW_USER@$NEW_HOST" \
    "python3 - <<'PY'
from pathlib import Path
p = Path('/root/.ssh/authorized_keys')
if p.exists():
    lines = p.read_text().splitlines()
    lines = [line for line in lines if '$MARKER' not in line]
    p.write_text('\\n'.join(lines) + ('\\n' if lines else ''))
PY" >/dev/null 2>&1
}
trap cleanup EXIT

echo "Authorizing temporary key on new server..."
ssh -i "$NEW_KEY" -o BatchMode=yes -o ConnectTimeout=10 -o StrictHostKeyChecking=accept-new "$NEW_USER@$NEW_HOST" \
  "mkdir -p /root/.ssh '$DEST_DIR' && chmod 700 /root/.ssh && touch /root/.ssh/authorized_keys && python3 - <<'PY'
from pathlib import Path
p = Path('/root/.ssh/authorized_keys')
s = p.read_text()
if s and not s.endswith('\\n'):
    p.write_text(s + '\\n')
PY
printf '%s %s\n' '$PUBKEY' '$MARKER' >> /root/.ssh/authorized_keys && chmod 600 /root/.ssh/authorized_keys"

DEST_PATH="$DEST_DIR/$(basename "$SOURCE_PATH")"

echo "Computing source checksum..."
export REMOTE_CMD="sha256sum '$SOURCE_PATH' && ls -lh '$SOURCE_PATH'"
run_old "$REMOTE_CMD"

echo "Transferring old:${SOURCE_PATH} -> new:${DEST_PATH}"
TRANSFER_CMD="
set -e
mkdir -p '$DEST_DIR'
if command -v rsync >/dev/null 2>&1; then
  rsync -avP -e \"ssh -i '$TEMP_KEY' -o StrictHostKeyChecking=accept-new -o ServerAliveInterval=15 -o ServerAliveCountMax=6\" '$SOURCE_PATH' '$NEW_USER@$NEW_HOST:$DEST_DIR/'
else
  scp -i '$TEMP_KEY' -o StrictHostKeyChecking=accept-new -o ServerAliveInterval=15 -o ServerAliveCountMax=6 '$SOURCE_PATH' '$NEW_USER@$NEW_HOST:$DEST_DIR/'
fi
"
export REMOTE_CMD="$TRANSFER_CMD"
run_old "$REMOTE_CMD"

echo "Verifying destination checksum..."
SRC_SHA="$(OLD_PASSWORD="$OLD_PASSWORD" REMOTE_CMD="sha256sum '$SOURCE_PATH' | awk '{print \\$1}'" run_old "$REMOTE_CMD" | awk '/^[a-f0-9]{64}$/ {print; exit}')"
DST_SHA="$(ssh -i "$NEW_KEY" -o BatchMode=yes -o ConnectTimeout=10 -o StrictHostKeyChecking=accept-new "$NEW_USER@$NEW_HOST" "sha256sum '$DEST_PATH' | awk '{print \$1}'")"

if [[ "$SRC_SHA" != "$DST_SHA" ]]; then
  echo "Checksum mismatch!" >&2
  echo "source: $SRC_SHA" >&2
  echo "dest:   $DST_SHA" >&2
  exit 1
fi

echo "Transfer complete and verified:"
echo "  $NEW_USER@$NEW_HOST:$DEST_PATH"
