#!/bin/bash

# 测试发布流程脚本
# 用于验证 GitHub Actions 配置是否正确

set -e

echo "🧪 测试 AkShot 发布流程"
echo "========================"

# 检查当前版本
echo "📋 当前版本信息:"
echo "  package.json: $(node -p "require('./package.json').version")"
echo "  Git 标签: $(git describe --tags --abbrev=0 2>/dev/null || echo '无标签')"
echo

# 清理之前的构建
echo "🧹 清理之前的构建..."
rm -rf .output
echo

# 构建项目
echo "🔨 构建项目..."
pnpm build:all
echo

# 打包扩展
echo "📦 打包扩展..."
pnpm zip:all
echo

# 检查生成的文件
echo "📁 检查生成的文件:"
ls -la .output/*.zip 2>/dev/null || echo "❌ 没有找到 zip 文件"
echo

# 模拟 GitHub Actions 的版本提取
echo "🔍 模拟 GitHub Actions 版本提取:"
VERSION=$(node -p "require('./package.json').version")
echo "  提取的版本号: $VERSION"
echo

# 检查预期的文件名
echo "✅ 检查预期的文件:"
CHROME_ZIP=".output/akshot-${VERSION}-chrome.zip"
FIREFOX_ZIP=".output/akshot-${VERSION}-firefox.zip"

if [ -f "$CHROME_ZIP" ]; then
    echo "  ✅ Chrome 包存在: $CHROME_ZIP"
else
    echo "  ❌ Chrome 包不存在: $CHROME_ZIP"
fi

if [ -f "$FIREFOX_ZIP" ]; then
    echo "  ✅ Firefox 包存在: $FIREFOX_ZIP"
else
    echo "  ❌ Firefox 包不存在: $FIREFOX_ZIP"
fi

echo
echo "🎉 测试完成！"
echo "如果所有检查都通过，说明 GitHub Actions 配置应该能正常工作。"