#!/bin/bash

# AkShot 发布脚本
# 使用方法: ./scripts/release.sh [版本号]
# 例如: ./scripts/release.sh 1.0.0
# 如果不提供版本号，将自动从 package.json 读取当前版本并递增补丁版本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 从 package.json 获取当前版本
get_current_version() {
    if command -v node &> /dev/null; then
        node -p "require('./package.json').version"
    elif command -v jq &> /dev/null; then
        jq -r '.version' package.json
    else
        # 使用 grep 和 sed 作为后备方案
        grep '"version"' package.json | sed 's/.*"version":[[:space:]]*"\([^"]*\)".*/\1/'
    fi
}

# 递增版本号
increment_patch_version() {
    local version=$1
    local major=$(echo $version | cut -d. -f1)
    local minor=$(echo $version | cut -d. -f2)
    local patch=$(echo $version | cut -d. -f3)
    local new_patch=$((patch + 1))
    echo "$major.$minor.$new_patch"
}

# 获取版本号
if [ $# -eq 0 ]; then
    CURRENT_VERSION=$(get_current_version)
    if [ -z "$CURRENT_VERSION" ]; then
        print_error "无法从 package.json 读取版本号"
        exit 1
    fi
    VERSION=$(increment_patch_version $CURRENT_VERSION)
    print_info "当前版本: $CURRENT_VERSION，将发布新版本: $VERSION"
    read -p "是否继续? (Y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        print_info "发布已取消"
        exit 1
    fi
else
    VERSION=$1
    # 验证版本号格式
    if ! [[ $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        print_error "版本号格式不正确，应该是 x.y.z 格式"
        exit 1
    fi
fi

print_info "准备发布版本 v$VERSION"

# 检查是否在 main 分支
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    print_warning "当前不在 main 分支 (当前: $CURRENT_BRANCH)"
    read -p "是否继续? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "发布已取消"
        exit 1
    fi
fi

# 检查工作目录是否干净
if [ -n "$(git status --porcelain)" ]; then
    print_error "工作目录不干净，请先提交或暂存更改"
    git status --short
    exit 1
fi

# 拉取最新代码
print_info "拉取最新代码..."
git pull origin main

# 更新 package.json 版本
print_info "更新 package.json 版本..."
npm version $VERSION --no-git-tag-version

# 运行测试和构建
print_info "运行类型检查..."
pnpm compile

print_info "构建 Chrome 版本..."
pnpm build

print_info "构建 Firefox 版本..."
pnpm build:firefox

print_success "构建完成"

# 提交版本更改
print_info "提交版本更改..."
git add package.json
git commit -m "chore: bump version to v$VERSION"

# 创建标签
print_info "创建 Git 标签..."
git tag -a "v$VERSION" -m "Release v$VERSION"

# 推送更改和标签
print_info "推送到远程仓库..."
git push origin main
git push origin "v$VERSION"

print_success "版本 v$VERSION 发布完成！"
print_info "请到 GitHub 创建 Release: https://github.com/myiya/akshot/releases/new?tag=v$VERSION"
print_info "GitHub Actions 将自动构建并上传安装包"

# 打开浏览器到 GitHub Release 页面（可选）
if command -v open &> /dev/null; then
    read -p "是否打开 GitHub Release 页面? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open "https://github.com/myiya/akshot/releases/new?tag=v$VERSION"
    fi
fi