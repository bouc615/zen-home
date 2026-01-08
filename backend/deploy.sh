#!/bin/bash

# ZenHome Backend 一键部署脚本
# 使用方法: ./deploy.sh

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查必要的命令
check_requirements() {
    print_info "检查系统要求..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi
    
    print_info "✓ 系统要求检查通过"
}

# 检查环境变量文件
check_env_file() {
    print_info "检查环境变量配置..."
    
    if [ ! -f .env ]; then
        print_warn ".env 文件不存在，从 .env.example 创建..."
        cp .env.example .env
        print_warn "请编辑 .env 文件，配置 Supabase 相关信息"
        print_warn "配置完成后，再次运行此脚本"
        exit 1
    fi
    
    # 检查必要的环境变量
    if ! grep -q "SUPABASE_URL=https://" .env; then
        print_error ".env 文件中 SUPABASE_URL 未配置"
        exit 1
    fi
    
    print_info "✓ 环境变量配置检查通过"
}

# 停止旧容器
stop_old_containers() {
    print_info "停止旧容器..."
    docker-compose down || true
    print_info "✓ 旧容器已停止"
}

# 构建镜像
build_image() {
    print_info "构建 Docker 镜像..."
    docker-compose build --no-cache
    print_info "✓ 镜像构建完成"
}

# 启动容器
start_containers() {
    print_info "启动容器..."
    docker-compose up -d
    print_info "✓ 容器启动成功"
}

# 等待服务启动
wait_for_service() {
    print_info "等待服务启动..."
    sleep 5
    
    # 检查健康状态
    max_attempts=30
    attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -f http://localhost:3000/health &> /dev/null; then
            print_info "✓ 服务启动成功"
            return 0
        fi
        
        attempt=$((attempt + 1))
        echo -n "."
        sleep 1
    done
    
    print_error "服务启动超时"
    docker-compose logs backend
    exit 1
}

# 显示部署信息
show_deployment_info() {
    echo ""
    echo "========================================="
    echo "🎉 部署成功！"
    echo "========================================="
    echo ""
    echo "服务地址: http://localhost:3000"
    echo "健康检查: http://localhost:3000/health"
    echo "AI 聊天测试: http://localhost:3000/chat.html"
    echo ""
    echo "常用命令:"
    echo "  查看日志: docker-compose logs -f"
    echo "  停止服务: docker-compose down"
    echo "  重启服务: docker-compose restart"
    echo ""
    echo "========================================="
}

# 主函数
main() {
    echo ""
    echo "========================================="
    echo "🚀 ZenHome Backend 一键部署"
    echo "========================================="
    echo ""
    
    check_requirements
    check_env_file
    stop_old_containers
    build_image
    start_containers
    wait_for_service
    show_deployment_info
}

# 运行主函数
main
