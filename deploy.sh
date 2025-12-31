#!/bin/bash

# 部署脚本 - 将网站部署到服务器

SERVER="root@106.54.34.190"
REMOTE_PATH="/usr/share/nginx/html/"
LOCAL_DIST="./dist/"

echo "🔨 开始构建项目..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败，请检查错误"
    exit 1
fi

echo "📦 开始上传到服务器..."
rsync -avz --delete "$LOCAL_DIST" "$SERVER:$REMOTE_PATH"

if [ $? -eq 0 ]; then
    echo "✅ 部署成功！"
    echo "🌐 访问地址: http://106.54.34.190/"
else
    echo "❌ 上传失败，请检查网络连接和服务器配置"
    exit 1
fi
