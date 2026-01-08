#!/bin/bash

# ZenHome Backend 快速更新脚本
# 用于更新代码后快速重新部署

set -e

GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}[INFO]${NC} 拉取最新代码..."
git pull

echo -e "${GREEN}[INFO]${NC} 重新构建并启动..."
docker-compose down
docker-compose up -d --build

echo -e "${GREEN}[INFO]${NC} 等待服务启动..."
sleep 5

if curl -f http://localhost:3000/health &> /dev/null; then
    echo -e "${GREEN}✓ 更新成功！${NC}"
else
    echo -e "${RED}✗ 服务启动失败，请检查日志${NC}"
    docker-compose logs backend
fi
