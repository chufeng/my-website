#!/bin/bash

# 完整部署脚本 - 前端 + 后端

SSH_KEY="$(cd "$(dirname "$0")" && pwd)/.secrets/ssh/京东云控制台 codex_te.pem"
SERVER="root@36.151.143.238"
SSH_OPTS="-i \"$SSH_KEY\" -o StrictHostKeyChecking=accept-new"
REMOTE_FRONTEND="/usr/share/nginx/html/jianli/"
REMOTE_BACKEND="/opt/portfolio-server/"

echo "========================================"
echo "   Portfolio 网站部署脚本"
echo "========================================"

# 选择部署模式
echo ""
echo "请选择部署模式:"
echo "  1) 仅部署前端（默认，最常用）"
echo "  2) 仅部署后端"
echo "  3) 完整部署（前端 + 后端）"
echo "  4) 首次部署（包含服务器初始化）"
echo "  5) 修复服务器文件权限（图片/资源403时使用）"
echo "  6) 同步本地数据库作品到服务器"
read -p "请输入选项 [1-6]: " choice

deploy_frontend() {
    local fix_perms=${1:-true}

    echo ""
    echo "🔧 修复本地文件权限..."
    chmod -R 644 ./img/* 2>/dev/null
    find ./img -type d -exec chmod 755 {} \; 2>/dev/null

    echo "🔨 开始构建前端项目..."
    npm run build

    if [ $? -ne 0 ]; then
        echo "❌ 构建失败，请检查错误"
        exit 1
    fi

    echo "📦 上传前端文件到服务器..."
    rsync -avz --delete -e "ssh -i \"$SSH_KEY\" -o StrictHostKeyChecking=accept-new" ./dist/ "$SERVER:$REMOTE_FRONTEND"

    if [ $? -eq 0 ]; then
        if [ "$fix_perms" = true ]; then
            echo "🔧 修复服务器文件权限..."
            ssh -i "$SSH_KEY" -o StrictHostKeyChecking=accept-new "$SERVER" "chmod -R 755 $REMOTE_FRONTEND && find $REMOTE_FRONTEND -type f -exec chmod 644 {} \;"
        else
            echo "⏭️  跳过权限修复"
        fi
        echo "✅ 前端部署成功！"
    else
        echo "❌ 前端上传失败"
        exit 1
    fi
}

deploy_backend() {
    echo ""
    echo "📦 上传后端文件到服务器..."
    rsync -avz --exclude 'node_modules' --exclude 'uploads' --exclude '*.db' -e "ssh -i \"$SSH_KEY\" -o StrictHostKeyChecking=accept-new" ./server/ "$SERVER:$REMOTE_BACKEND"

    echo "📥 在服务器上安装依赖并重启服务..."
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=accept-new "$SERVER" "cd $REMOTE_BACKEND && npm install --production && pm2 restart portfolio-api || pm2 start index.js --name portfolio-api"

    if [ $? -eq 0 ]; then
        echo "✅ 后端部署成功！"
    else
        echo "❌ 后端部署失败"
        exit 1
    fi
}

init_server() {
    echo ""
    echo "🔧 初始化服务器..."

    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=accept-new "$SERVER" << 'EOF'
        # 安装 Node.js (如果没有)
        if ! command -v node &> /dev/null; then
            curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
            apt-get install -y nodejs
        fi

        # 安装 PM2 (进程管理)
        npm install -g pm2

        # 创建后端目录
        mkdir -p /opt/portfolio-server/uploads

        echo "✅ 服务器初始化完成"
EOF

    echo ""
    echo "📝 请手动配置 nginx:"
    echo "   1. 将 server/nginx.conf 的内容添加到服务器的 nginx 配置"
    echo "   2. 运行: nginx -t && systemctl reload nginx"
}

fix_server_permissions() {
    echo ""
    echo "🔧 修复服务器文件权限..."
    echo "   （当图片或资源文件出现 403 Forbidden 错误时使用此选项）"
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=accept-new "$SERVER" "chmod -R 755 $REMOTE_FRONTEND && find $REMOTE_FRONTEND -type f -exec chmod 644 {} \;"
    if [ $? -eq 0 ]; then
        echo "✅ 权限修复完成！"
    else
        echo "❌ 权限修复失败"
        exit 1
    fi
}

sync_database() {
    echo ""
    echo "📦 同步本地数据库作品到服务器..."
    echo "   （本地新增的作品会上传，已存在的会跳过）"
    echo ""
    cd server && node sync-to-server.js
    cd ..
}

case $choice in
    1)
        deploy_frontend false
        ;;
    2)
        deploy_backend
        ;;
    3)
        deploy_frontend false
        deploy_backend
        ;;
    4)
        init_server
        deploy_frontend true
        deploy_backend
        ;;
    5)
        fix_server_permissions
        ;;
    6)
        sync_database
        ;;
    *)
        echo "无效选项"
        exit 1
        ;;
esac

echo ""
echo "========================================"
echo "🌐 网站地址: http://36.151.143.238/jianli/"
echo "💌 Love 页面: http://36.151.143.238/love"
echo "🔧 管理后台: http://36.151.143.238/jianli/admin"
echo "   默认账号: admin / admin123"
echo "========================================"
