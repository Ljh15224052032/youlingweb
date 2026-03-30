#!/bin/bash

# 在阿里云服务器上执行的一键迁移脚本
# 从 Supabase 导出并直接导入到本地 PostgreSQL
# 使用方法: bash scripts/migrate_on_server.sh

set -e  # 遇到错误立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Supabase 到阿里云 PostgreSQL 一键迁移${NC}"
echo -e "${GREEN}（在服务器上执行）${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 检查是否安装了 pg_dump 和 pg_restore
if ! command -v pg_dump &> /dev/null; then
    echo -e "${YELLOW}📦 正在安装 PostgreSQL 客户端工具...${NC}"
    if command -v apt-get &> /dev/null; then
        sudo apt update
        sudo apt install -y postgresql-client
    elif command -v yum &> /dev/null; then
        sudo yum install -y postgresql
    else
        echo -e "${RED}❌ 错误: 无法自动安装 PostgreSQL 客户端${NC}"
        echo "请手动安装: sudo apt install postgresql-client 或 sudo yum install postgresql"
        exit 1
    fi
fi

echo -e "${GREEN}✅ PostgreSQL 客户端工具已就绪${NC}"
echo ""

# 从环境变量文件读取配置（如果存在）
if [ -f .env.supabase ]; then
    echo -e "${GREEN}📄 从 .env.supabase 读取 Supabase 配置...${NC}"
    # 使用更安全的方式读取配置文件，处理 Windows 换行符
    set -a
    export $(grep -v '^#' .env.supabase | grep -v '^$' | sed 's/\r$//' | xargs)
    set +a
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
    read -sp "请输入 Supabase 密码: " SUPABASE_PASSWORD
    echo ""
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📋 目标数据库配置（阿里云 PostgreSQL）${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# 提示用户输入目标数据库信息
read -p "请输入目标数据库名 (例如: youling_db): " TARGET_DB
read -p "请输入目标数据库用户 (默认: postgres): " TARGET_USER
TARGET_USER=${TARGET_USER:-postgres}

if [ "$TARGET_USER" = "postgres" ]; then
    echo -e "${YELLOW}💡 使用 postgres 用户，将使用 sudo 权限${NC}"
    TARGET_PASSWORD=""
else
    echo -e "${YELLOW}💡 密码输入时不会显示（安全设计），输入完成后按 Enter${NC}"
    read -sp "请输入目标数据库密码: " TARGET_PASSWORD
    echo ""
    if [ -z "$TARGET_PASSWORD" ]; then
        echo -e "${YELLOW}⚠️  密码为空，尝试使用普通输入方式...${NC}"
        read -p "请输入目标数据库密码（可见）: " TARGET_PASSWORD
    fi
fi

# 设置备份文件名
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="/tmp/supabase_backup_${TIMESTAMP}.dump"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📋 迁移配置总览${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "源数据库 (Supabase):"
echo -e "  主机: ${GREEN}$SUPABASE_HOST${NC}"
echo -e "  端口: ${GREEN}$SUPABASE_PORT${NC}"
echo -e "  数据库: ${GREEN}$SUPABASE_DB${NC}"
echo -e "  用户: ${GREEN}$SUPABASE_USER${NC}"
echo ""
echo -e "目标数据库 (阿里云):"
echo -e "  数据库: ${GREEN}$TARGET_DB${NC}"
echo -e "  用户: ${GREEN}$TARGET_USER${NC}"
echo ""
echo -e "备份文件: ${GREEN}$BACKUP_FILE${NC}"
echo ""

# 确认
read -p "⚠️  确认开始迁移? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo -e "${YELLOW}已取消迁移${NC}"
    exit 0
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}步骤 1/2: 从 Supabase 导出数据${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 检查目标数据库是否存在
if [ "$TARGET_USER" = "postgres" ]; then
    DB_EXISTS=$(sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw "$TARGET_DB" && echo "yes" || echo "no")
else
    export PGPASSWORD="$TARGET_PASSWORD"
    DB_EXISTS=$(psql -h localhost -U "$TARGET_USER" -lqt | cut -d \| -f 1 | grep -qw "$TARGET_DB" && echo "yes" || echo "no")
    unset PGPASSWORD
fi

if [ "$DB_EXISTS" != "yes" ]; then
    echo -e "${YELLOW}⚠️  目标数据库 '$TARGET_DB' 不存在${NC}"
    read -p "是否现在创建? (y/n): " CREATE_DB
    if [ "$CREATE_DB" = "y" ] || [ "$CREATE_DB" = "Y" ]; then
        if [ "$TARGET_USER" = "postgres" ]; then
            sudo -u postgres createdb "$TARGET_DB"
            echo -e "${GREEN}✅ 数据库已创建${NC}"
        else
            export PGPASSWORD="$TARGET_PASSWORD"
            createdb -h localhost -U "$TARGET_USER" "$TARGET_DB"
            unset PGPASSWORD
            echo -e "${GREEN}✅ 数据库已创建${NC}"
        fi
    else
        echo -e "${RED}❌ 请先在宝塔面板中创建数据库${NC}"
        exit 1
    fi
fi

# 设置 Supabase 密码环境变量
export PGPASSWORD="$SUPABASE_PASSWORD"

# 强制使用 IPv4（解析 IPv4 地址）
echo -e "${YELLOW}🔍 解析 Supabase IPv4 地址...${NC}"
SUPABASE_IP=$(getent hosts "$SUPABASE_HOST" | awk '{print $1}' | grep -E '^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$' | head -1)

if [ -z "$SUPABASE_IP" ]; then
    # 如果 getent 失败，尝试使用 host 命令
    SUPABASE_IP=$(host "$SUPABASE_HOST" | grep -oE '([0-9]{1,3}\.){3}[0-9]{1,3}' | head -1)
fi

if [ -n "$SUPABASE_IP" ]; then
    echo -e "${GREEN}✅ 使用 IPv4 地址: $SUPABASE_IP${NC}"
    SUPABASE_HOST_TO_USE="$SUPABASE_IP"
else
    echo -e "${YELLOW}⚠️  无法解析 IPv4 地址，使用主机名${NC}"
    SUPABASE_HOST_TO_USE="$SUPABASE_HOST"
fi

# 执行导出
echo ""
echo -e "${YELLOW}📤 正在从 Supabase 导出数据...${NC}"
echo "这可能需要几分钟到几十分钟，请耐心等待..."
echo ""

pg_dump \
  -h "$SUPABASE_HOST_TO_USE" \
  -U "$SUPABASE_USER" \
  -p "$SUPABASE_PORT" \
  -d "$SUPABASE_DB" \
  -Fc \
  -f "$BACKUP_FILE" \
  --verbose

if [ $? -ne 0 ]; then
    echo ""
    echo -e "${RED}❌ 导出失败!${NC}"
    echo "请检查 Supabase 连接信息"
    unset PGPASSWORD
    exit 1
fi

# 获取文件大小
FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo ""
echo -e "${GREEN}✅ 导出成功!${NC}"
echo -e "${GREEN}📦 备份文件: $BACKUP_FILE (大小: $FILE_SIZE)${NC}"

# 清理 Supabase 密码
unset PGPASSWORD

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}步骤 2/2: 导入数据到阿里云 PostgreSQL${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 执行导入
echo -e "${YELLOW}📥 正在导入数据到本地 PostgreSQL...${NC}"
echo "这可能需要几分钟到几十分钟，请耐心等待..."
echo ""

if [ "$TARGET_USER" = "postgres" ]; then
    # 使用 postgres 用户
    sudo -u postgres pg_restore \
      -h localhost \
      -U postgres \
      -d "$TARGET_DB" \
      -v \
      --clean \
      --if-exists \
      "$BACKUP_FILE"
else
    # 使用其他用户
    export PGPASSWORD="$TARGET_PASSWORD"
    pg_restore \
      -h localhost \
      -U "$TARGET_USER" \
      -d "$TARGET_DB" \
      -v \
      --clean \
      --if-exists \
      "$BACKUP_FILE"
    unset PGPASSWORD
fi

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ 迁移完成!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}💡 下一步:${NC}"
    echo "  1. 验证数据: sudo -u postgres psql -d $TARGET_DB"
    echo "  2. 查看表: \\dt"
    echo "  3. 检查数据: SELECT COUNT(*) FROM users;"
    echo "  4. 更新应用数据库连接配置"
    echo ""
    
    # 询问是否删除备份文件
    read -p "是否删除临时备份文件? (y/n): " DELETE_BACKUP
    if [ "$DELETE_BACKUP" = "y" ] || [ "$DELETE_BACKUP" = "Y" ]; then
        rm -f "$BACKUP_FILE"
        echo -e "${GREEN}✅ 备份文件已删除${NC}"
    else
        echo -e "${YELLOW}💡 备份文件保留在: $BACKUP_FILE${NC}"
    fi
else
    echo ""
    echo -e "${RED}❌ 导入失败!${NC}"
    echo "请检查错误信息并参考 MIGRATION_GUIDE.md 进行排查"
    echo -e "${YELLOW}💡 备份文件保留在: $BACKUP_FILE${NC}"
    exit 1
fi

