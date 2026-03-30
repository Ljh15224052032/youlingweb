#!/bin/bash

# 阿里云 PostgreSQL 导入脚本（适用于宝塔面板）
# 使用方法: bash scripts/import_to_aliyun.sh

set -e  # 遇到错误立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}阿里云 PostgreSQL 导入工具${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 检查是否安装了 pg_restore
if ! command -v pg_restore &> /dev/null; then
    echo -e "${RED}❌ 错误: 未找到 pg_restore 命令${NC}"
    echo -e "${YELLOW}请先安装 PostgreSQL 客户端工具:${NC}"
    echo "  Ubuntu/Debian: sudo apt install postgresql-client"
    echo "  CentOS/RHEL: sudo yum install postgresql"
    exit 1
fi

# 从环境变量或用户输入获取配置
if [ -f .env.aliyun ]; then
    echo -e "${GREEN}📄 从 .env.aliyun 读取配置...${NC}"
    source .env.aliyun
fi

# 提示用户输入备份文件路径
if [ -z "$BACKUP_FILE" ]; then
    read -p "请输入备份文件路径 (例如: supabase_backup.dump): " BACKUP_FILE
fi

# 检查备份文件是否存在
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}❌ 错误: 备份文件不存在: $BACKUP_FILE${NC}"
    exit 1
fi

# 提示用户输入数据库连接信息
if [ -z "$DB_HOST" ]; then
    read -p "请输入数据库主机 (默认: localhost): " DB_HOST
    DB_HOST=${DB_HOST:-localhost}
fi

if [ -z "$DB_PORT" ]; then
    read -p "请输入端口 (默认: 5432): " DB_PORT
    DB_PORT=${DB_PORT:-5432}
fi

if [ -z "$DB_NAME" ]; then
    read -p "请输入目标数据库名: " DB_NAME
fi

if [ -z "$DB_USER" ]; then
    read -p "请输入数据库用户 (默认: postgres): " DB_USER
    DB_USER=${DB_USER:-postgres}
fi

if [ -z "$DB_PASSWORD" ]; then
    read -sp "请输入密码: " DB_PASSWORD
    echo ""
fi

echo ""
echo -e "${YELLOW}📋 导入配置:${NC}"
echo "  备份文件: $BACKUP_FILE"
echo "  主机: $DB_HOST"
echo "  端口: $DB_PORT"
echo "  数据库: $DB_NAME"
echo "  用户: $DB_USER"
echo ""

# 显示备份文件信息
FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo -e "${GREEN}📦 备份文件大小: $FILE_SIZE${NC}"
echo ""

# 确认
read -p "⚠️  导入将覆盖现有数据，确认继续? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo -e "${YELLOW}已取消导入${NC}"
    exit 0
fi

echo ""
echo -e "${GREEN}🚀 开始导入...${NC}"
echo ""

# 设置密码环境变量
export PGPASSWORD="$DB_PASSWORD"

# 检查数据库是否存在
echo -e "${YELLOW}🔍 检查数据库连接...${NC}"
psql -h "$DB_HOST" -U "$DB_USER" -p "$DB_PORT" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME" || {
    echo -e "${RED}❌ 错误: 数据库 '$DB_NAME' 不存在${NC}"
    echo -e "${YELLOW}请先在宝塔面板中创建数据库${NC}"
    exit 1
}

echo -e "${GREEN}✅ 数据库连接正常${NC}"
echo ""

# 执行导入
echo -e "${GREEN}📥 正在导入数据...${NC}"
pg_restore \
  -h "$DB_HOST" \
  -U "$DB_USER" \
  -p "$DB_PORT" \
  -d "$DB_NAME" \
  -v \
  --clean \
  --if-exists \
  "$BACKUP_FILE"

# 检查导入是否成功
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ 导入成功!${NC}"
    echo ""
    echo -e "${YELLOW}💡 下一步:${NC}"
    echo "  1. 验证数据: sudo -u postgres psql -d $DB_NAME"
    echo "  2. 检查表: \\dt"
    echo "  3. 检查数据: SELECT COUNT(*) FROM users;"
    echo "  4. 更新应用数据库连接配置"
else
    echo ""
    echo -e "${RED}❌ 导入失败!${NC}"
    echo "请检查错误信息并参考 MIGRATION_GUIDE.md 进行排查"
    exit 1
fi

# 清理密码环境变量
unset PGPASSWORD

