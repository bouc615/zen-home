#!/bin/bash

# ZenHome 完整部署脚本（包含 Nginx 和 SSL）
# 适用于生产环境首次部署

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 读取配置
read -p "请输入你的域名（如 api.example.com）: " DOMAIN
read -p "请输入你的邮箱（用于 SSL 证书）: " EMAIL

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    print_error "域名和邮箱不能为空"
    exit 1
fi

# 检查系统
print_info "检查系统要求..."
if ! command -v nginx &> /dev/null; then
    print_warn "Nginx 未安装，正在安装..."
    sudo apt update
    sudo apt install -y nginx
fi

if ! command -v certbot &> /dev/null; then
    print_warn "Certbot 未安装，正在安装..."
    sudo apt install -y certbot python3-certbot-nginx
fi

# 配置 Nginx
print_info "配置 Nginx..."
sudo tee /etc/nginx/sites-available/zen-home-api > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/zen-home-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

print_info "✓ Nginx 配置完成"

# 配置 SSL
print_info "配置 SSL 证书..."
sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m $EMAIL

print_info "✓ SSL 证书配置完成"

# 部署后端
print_info "部署后端服务..."
cd "$(dirname "$0")"
./deploy.sh

# 显示完成信息
echo ""
echo "========================================="
echo "🎉 完整部署成功！"
echo "========================================="
echo ""
echo "你的 API 地址: https://$DOMAIN"
echo "健康检查: https://$DOMAIN/health"
echo "AI 聊天测试: https://$DOMAIN/chat.html"
echo ""
echo "下一步:"
echo "1. 在微信小程序后台配置服务器域名: https://$DOMAIN"
echo "2. 更新前端配置中的 API 地址"
echo "3. 测试所有功能"
echo ""
echo "========================================="
