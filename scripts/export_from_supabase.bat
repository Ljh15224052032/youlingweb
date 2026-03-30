@echo off
REM Supabase 数据库导出脚本 (Windows)
REM 使用方法: scripts\export_from_supabase.bat

setlocal enabledelayedexpansion

echo ========================================
echo Supabase 数据库导出工具 (Windows)
echo ========================================
echo.

REM 检查是否安装了 pg_dump
where pg_dump >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未找到 pg_dump 命令
    echo 请先安装 PostgreSQL for Windows:
    echo https://www.postgresql.org/download/windows/
    pause
    exit /b 1
)

REM 从环境变量文件读取配置（如果存在）
if exist .env.supabase (
    echo [信息] 从 .env.supabase 读取配置...
    for /f "usebackq tokens=1,2 delims==" %%a in (".env.supabase") do (
        if "%%a"=="SUPABASE_HOST" set SUPABASE_HOST=%%b
        if "%%a"=="SUPABASE_PORT" set SUPABASE_PORT=%%b
        if "%%a"=="SUPABASE_DB" set SUPABASE_DB=%%b
        if "%%a"=="SUPABASE_USER" set SUPABASE_USER=%%b
        if "%%a"=="SUPABASE_PASSWORD" set SUPABASE_PASSWORD=%%b
    )
)

REM 提示用户输入配置
if "%SUPABASE_HOST%"=="" (
    set /p SUPABASE_HOST="请输入 Supabase 数据库主机 (例如: db.xxx.supabase.co): "
)

if "%SUPABASE_PORT%"=="" (
    set /p SUPABASE_PORT="请输入端口 (默认: 5432): "
    if "!SUPABASE_PORT!"=="" set SUPABASE_PORT=5432
)

if "%SUPABASE_DB%"=="" (
    set /p SUPABASE_DB="请输入数据库名 (默认: postgres): "
    if "!SUPABASE_DB!"=="" set SUPABASE_DB=postgres
)

if "%SUPABASE_USER%"=="" (
    set /p SUPABASE_USER="请输入用户名 (默认: postgres): "
    if "!SUPABASE_USER!"=="" set SUPABASE_USER=postgres
)

if "%SUPABASE_PASSWORD%"=="" (
    set /p SUPABASE_PASSWORD="请输入密码: "
)

REM 设置输出文件名
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set TIMESTAMP=%datetime:~0,8%_%datetime:~8,6%
set OUTPUT_FILE=supabase_backup_%TIMESTAMP%.dump

echo.
echo [配置] 导出配置:
echo   主机: %SUPABASE_HOST%
echo   端口: %SUPABASE_PORT%
echo   数据库: %SUPABASE_DB%
echo   用户: %SUPABASE_USER%
echo   输出文件: %OUTPUT_FILE%
echo.

REM 确认
set /p CONFIRM="确认开始导出? (y/n): "
if /i not "%CONFIRM%"=="y" (
    echo 已取消导出
    pause
    exit /b 0
)

echo.
echo [开始] 正在导出...
echo.

REM 设置密码环境变量并执行导出
set PGPASSWORD=%SUPABASE_PASSWORD%
pg_dump -h %SUPABASE_HOST% -U %SUPABASE_USER% -p %SUPABASE_PORT% -d %SUPABASE_DB% -Fc -f %OUTPUT_FILE% --verbose

if %errorlevel% equ 0 (
    echo.
    echo [成功] 导出完成!
    echo [文件] %OUTPUT_FILE%
    echo.
    echo [提示] 下一步:
    echo   1. 将备份文件上传到阿里云服务器
    echo   2. 使用 scripts\import_to_aliyun.sh 导入数据
    echo   或参考 MIGRATION_GUIDE.md 进行手动导入
) else (
    echo.
    echo [错误] 导出失败!
    echo 请检查连接信息和网络连接
)

REM 清理密码环境变量
set PGPASSWORD=

echo.
pause

