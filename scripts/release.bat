@echo off
setlocal enabledelayedexpansion

REM AkShot 发布脚本 (Windows)
REM 使用方法: scripts\release.bat [版本号]
REM 例如: scripts\release.bat 1.0.0
REM 如果不提供版本号，将自动从 package.json 读取当前版本并递增补丁版本

REM 从 package.json 获取当前版本
:get_current_version
for /f "tokens=2 delims=:,\"" %%i in ('findstr /r "\"version\"" package.json') do (
    set CURRENT_VERSION=%%i
    set CURRENT_VERSION=!CURRENT_VERSION: =!
)
goto :eof

REM 递增补丁版本号
:increment_patch_version
for /f "tokens=1,2,3 delims=." %%a in ("%CURRENT_VERSION%") do (
    set /a NEW_PATCH=%%c+1
    set NEW_VERSION=%%a.%%b.!NEW_PATCH!
)
goto :eof

REM 获取版本号
if "%1"=="" (
    call :get_current_version
    if "!CURRENT_VERSION!"=="" (
        echo ❌ 无法从 package.json 读取版本号
        exit /b 1
    )
    call :increment_patch_version
    set VERSION=!NEW_VERSION!
    echo ℹ️  当前版本: !CURRENT_VERSION!，将发布新版本: !VERSION!
    set /p "REPLY=是否继续? (Y/n): "
    if /i "!REPLY!"=="n" (
        echo ℹ️  发布已取消
        exit /b 1
    )
) else (
    set VERSION=%1
    REM 验证版本号格式 (简单检查)
    echo !VERSION! | findstr /r "^[0-9]*\.[0-9]*\.[0-9]*$" >nul
    if errorlevel 1 (
        echo ❌ 版本号格式不正确，应该是 x.y.z 格式
        exit /b 1
    )
)

echo ℹ️  准备发布版本 v%VERSION%

REM 检查是否在 main 分支
for /f "tokens=*" %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i
if not "%CURRENT_BRANCH%"=="main" (
    echo ⚠️  当前不在 main 分支 (当前: %CURRENT_BRANCH%)
    set /p "REPLY=是否继续? (y/N): "
    if /i not "!REPLY!"=="y" (
        echo ℹ️  发布已取消
        exit /b 1
    )
)

REM 检查工作目录是否干净
git status --porcelain | findstr /r ".*" >nul
if not errorlevel 1 (
    echo ❌ 工作目录不干净，请先提交或暂存更改
    git status --short
    exit /b 1
)

REM 拉取最新代码
echo ℹ️  拉取最新代码...
git pull origin main
if errorlevel 1 (
    echo ❌ 拉取代码失败
    exit /b 1
)

REM 更新 package.json 版本
echo ℹ️  更新 package.json 版本...
npm version %VERSION% --no-git-tag-version
if errorlevel 1 (
    echo ❌ 更新版本失败
    exit /b 1
)

REM 运行测试和构建
echo ℹ️  运行类型检查...
pnpm compile
if errorlevel 1 (
    echo ❌ 类型检查失败
    exit /b 1
)

echo ℹ️  构建 Chrome 版本...
pnpm build
if errorlevel 1 (
    echo ❌ Chrome 构建失败
    exit /b 1
)

echo ℹ️  构建 Firefox 版本...
pnpm build:firefox
if errorlevel 1 (
    echo ❌ Firefox 构建失败
    exit /b 1
)

echo ✅ 构建完成

REM 提交版本更改
echo ℹ️  提交版本更改...
git add package.json
git commit -m "chore: bump version to v%VERSION%"
if errorlevel 1 (
    echo ❌ 提交失败
    exit /b 1
)

REM 创建标签
echo ℹ️  创建 Git 标签...
git tag -a "v%VERSION%" -m "Release v%VERSION%"
if errorlevel 1 (
    echo ❌ 创建标签失败
    exit /b 1
)

REM 推送更改和标签
echo ℹ️  推送到远程仓库...
git push origin main
if errorlevel 1 (
    echo ❌ 推送 main 分支失败
    exit /b 1
)

git push origin "v%VERSION%"
if errorlevel 1 (
    echo ❌ 推送标签失败
    exit /b 1
)

echo ✅ 版本 v%VERSION% 发布完成！
echo ℹ️  请到 GitHub 创建 Release: https://github.com/your-username/akshot/releases/new?tag=v%VERSION%
echo ℹ️  GitHub Actions 将自动构建并上传安装包

REM 询问是否打开浏览器
set /p "REPLY=是否打开 GitHub Release 页面? (y/N): "
if /i "!REPLY!"=="y" (
    start "" "https://github.com/your-username/akshot/releases/new?tag=v%VERSION%"
)

endlocal