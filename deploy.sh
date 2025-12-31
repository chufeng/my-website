#!/bin/bash

# 完整部署脚本 - 前端 + 后端

SERVER="root@106.54.34.190"
REMOTE_FRONTEND="/usr/share/nginx/html/"
REMOTE_BACKEND="/opt/portfolio-server/"

echo "========================================"
echo "   Portfolio 网站部署脚本"
echo "========================================"

# 选择部署模式
echo ""
echo "请选择部署模式:"
echo "  1) 仅部署前端"
echo "  2) 仅部署后端"
echo "  3) 完整部署（前端 + 后端）"
echo "  4) 首次部署（包含服务器初始化）"
read -p "请输入选项 [1-4]: " choice

deploy_frontend() {
    echo ""
    echo "🔨 开始构建前端项目..."
    npm run build

    if [ $? -ne 0 ]; then
        echo "❌ 构建失败，请检查错误"
        exit 1
    fi

    echo "📦 上传前端文件到服务器..."
    rsync -avz --delete ./dist/ "$SERVER:$REMOTE_FRONTEND"

    if [ $? -eq 0 ]; then
        echo "✅ 前端部署成功！"
    else
        echo "❌ 前端上传失败"
        exit 1
    fi
}

deploy_backend() {
    echo ""
    echo "📦 上传后端文件到服务器..."
    rsync -avz --exclude 'node_modules' --exclude 'uploads' --exclude '*.db' ./server/ "$SERVER:$REMOTE_BACKEND"

    echo "📥 在服务器上安装依赖并重启服务..."
    ssh "$SERVER" "cd $REMOTE_BACKEND && npm install --production && pm2 restart portfolio-api || pm2 start index.js --name portfolio-api"

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

    ssh "$SERVER" << 'EOF'
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

case $choice in
    1)
        deploy_frontend
        ;;
    2)
        deploy_backend
        ;;
    3)
        deploy_frontend
        deploy_backend
        ;;
    4)
        init_server
        deploy_frontend
        deploy_backend
        ;;
    *)
        echo "无效选项"
        exit 1
        ;;
esac

echo ""
echo "========================================"
echo "🌐 网站地址: http://106.54.34.190/"
echo "🔧 管理后台: http://106.54.34.190/admin"
echo "   默认账号: admin / admin123"
echo "========================================"
