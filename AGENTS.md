# Workspace Notes

This workspace is for the website and VPS services under `/Users/chufeng/Documents/网站`.

## VPS Access

Primary new server:

- Host: `36.151.143.238`
- User: `root`
- SSH key path: `/Users/chufeng/Documents/网站/.secrets/ssh/京东云控制台 codex_te.pem`

Use this command for one-off checks:

```bash
ssh -i "/Users/chufeng/Documents/网站/.secrets/ssh/京东云控制台 codex_te.pem" \
  -o BatchMode=yes \
  -o ConnectTimeout=10 \
  -o StrictHostKeyChecking=accept-new \
  root@36.151.143.238 'hostname && df -hT && free -h'
```

For an interactive shell:

```bash
ssh -i "/Users/chufeng/Documents/网站/.secrets/ssh/京东云控制台 codex_te.pem" \
  -o StrictHostKeyChecking=accept-new \
  root@36.151.143.238
```

Never print, copy, commit, or upload the SSH private key contents. The `.secrets/` directory is local-only.

## Known Services

Website:

- Public entry: `http://36.151.143.238/`
- Backend should be reached through Nginx, not directly from the public internet.
- Backend process currently uses port `3001`; prefer binding or firewalling it so only local Nginx can reach it.

AstrBot / NapCat:

- AstrBot WebUI: `6185/tcp`
- AstrBot / OneBot WebSocket: `6199/tcp`
- NapCat WebUI: `6099/tcp`

Anime stack:

- Deployment doc: `docs/anime-stack-deployment.md`
- WebUI entry points are all behind Nginx Basic Auth:
  - `/anime/qb/`
  - `/anime/ab/`
  - `/anime/files/`
- qBittorrent WebUI: `127.0.0.1:8081`
- AutoBangumi WebUI: `127.0.0.1:7892`
- OpenList WebUI: `127.0.0.1:5244`
- qBittorrent BT listen port: `46881/tcp` and `46881/udp`

## Port Guidance

Ports that normally need cloud security group access:

- `22/tcp` for SSH
- `80/tcp` for Nginx
- `6099/tcp`, `6185/tcp`, `6199/tcp` if AstrBot/NapCat should be public
- `46881/tcp` and `46881/udp` for qBittorrent BT connectivity

Ports that should normally stay closed to the public:

- `3001/tcp` website backend direct access
- `8081/tcp`, `7892/tcp`, `5244/tcp` anime stack WebUIs
- `8501/tcp` unless a future service explicitly uses it

## Useful Server Checks

```bash
ss -lntup
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
nginx -T 2>/dev/null | grep -E "listen |server_name|proxy_pass|/anime/|3001|6099|6185|6199|46881|8081|7892|5244|8501"
ufw status verbose 2>/dev/null || firewall-cmd --list-all 2>/dev/null || iptables -S INPUT
```

For anime stack:

```bash
cd /opt/anime-stack
docker compose ps
systemctl status anime-sync.timer
tail -80 /data/anime/logs/anime-sync.log
```
