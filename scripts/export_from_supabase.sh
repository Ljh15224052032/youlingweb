#!/bin/bash

# Supabase 数据库导出脚本
# 使用方法: bash scripts/export_from_supabase.sh

set -e  # 遇到错误立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Supabase 数据库导出工具${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 检查是否安装了 pg_dump
if ! command -v pg_dump &> /dev/null; then
    echo -e "${RED}❌ 错误: 未找到 pg_dump 命令${NC}"
    echo -e "${YELLOW}请先安装 PostgreSQL 客户端工具:${NC}"
    echo "  Ubuntu/Debian: sudo apt install postgresql-client"
    echo "  CentOS/RHEL: sudo yum install postgresql"
    echo "  macOS: brew install postgresql"
    echo "  Windows: 下载并安装 PostgreSQL for Windows"
    exit 1
fi

# 从环境变量或用户输入获取配置
if [ -f .env.supabase ]; then
    echo -e "${GREEN}📄 从 .env.supabase 读取配置...${NC}"
    source .env.supabase
fi

# 提示用户输入 Supabase 连接信息
if [ -z "$SUPABASE_HOST" ]; then
    read -p "请输入 Supabase 数据库主机 (例如: db.xxx.supabase.co): " SUPABASE_HOST
fi

if [ -z "$SUPABASE_PORT" ]; then
    read -p "请输入端口 (默认: 5432): " SUPABASE_PORT
    SUPABASE_PORT=${SUPABASE_PORT:-5432}
fi

if [ -z "$SUPABASE_DB" ]; then
    read -p "请输入数据库名 (默认: postgres): " SUPABASE_DB
    SUPABASE_DB=${SUPABASE_DB:-postgres}
fi

if [ -z "$SUPABASE_USER" ]; then
    read -p "请输入用户名 (默认: postgres): " SUPABASE_USER
    SUPABASE_USER=${SUPABASE_USER:-postgres}
fi

if [ -z "$SUPABASE_PASSWORD" ]; then
    read -sp "请输入密码: " SUPABASE_PASSWORD
    echo ""
fi

# 设置输出文件名
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT_FILE="supabase_backup_${TIMESTAMP}.dump"

echo ""
echo -e "${YELLOW}📋 导出配置:${NC}"
echo "  主机: $SUPABASE_HOST"
echo "  端口: $SUPABASE_PORT"
echo "  数据库: $SUPABASE_DB"
echo "  用户: $SUPABASE_USER"
echo "  输出文件: $OUTPUT_FILE"
echo ""

# 确认
read -p "确认开始导出? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo -e "${YELLOW}已取消导出${NC}"
    exit 0
fi

echo ""
echo -e "${GREEN}🚀 开始导出...${NC}"
echo ""

# 设置密码环境变量
export PGPASSWORD="$SUPABASE_PASSWORD"

# 执行导出
pg_dump \
  -h "$SUPABASE_HOST" \
  -U "$SUPABASE_USER" \
  -p "$SUPABASE_PORT" \
  -d "$SUPABASE_DB" \
  -Fc \
  -f "$OUTPUT_FILE" \
  --verbose

# 检查导出是否成功
if [ $? -eq 0 ]; then
    # 获取文件大小
    FILE_SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
    echo ""
    echo -e "${GREEN}✅ 导出成功!${NC}"
    echo -e "${GREEN}📦 备份文件: $OUTPUT_FILE (大小: $FILE_SIZE)${NC}"
    echo ""
    echo -e "${YELLOW}💡 下一步:${NC}"
    echo "  1. 将备份文件上传到阿里云服务器"
    echo "  2. 使用 scripts/import_to_aliyun.sh 导入数据"
    echo "  或参考 MIGRATION_GUIDE.md 进行手动导入"
else
    echo ""
    echo -e "${RED}❌ 导出失败!${NC}"
    echo "请检查连接信息和网络连接"
    exit 1
fi

# 清理密码环境变量
unset PGPASSWORD

