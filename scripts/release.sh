#!/bin/bash

# 版本发布脚本
# 使用方法: ./scripts/release.sh [patch|minor|major|版本号]

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# 检查是否在 main 分支
check_branch() {
    local current_branch=$(git branch --show-current)
    if [ "$current_branch" != "main" ]; then
        print_message $RED "❌ 错误: 请在 main 分支上发布版本，当前分支: $current_branch"
        exit 1
    fi
}

# 检查工作目录是否干净
check_clean() {
    if ! git diff-index --quiet HEAD --; then
        print_message $RED "❌ 错误: 工作目录不干净，请先提交所有更改"
        git status --short
        exit 1
    fi
}

# 检查是否与远程同步
check_sync() {
    git fetch origin
    local local_commit=$(git rev-parse HEAD)
    local remote_commit=$(git rev-parse origin/main)
    
    if [ "$local_commit" != "$remote_commit" ]; then
        print_message $RED "❌ 错误: 本地分支与远程不同步，请先 pull 或 push"
        exit 1
    fi
}

# 获取当前版本
get_current_version() {
    node -p "require('./package.json').version"
}

# 计算新版本
calculate_new_version() {
    local current_version=$1
    local bump_type=$2
    
    if [[ $bump_type =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        echo $bump_type
        return
    fi
    
    IFS='.' read -ra VERSION_PARTS <<< "$current_version"
    local major=${VERSION_PARTS[0]}
    local minor=${VERSION_PARTS[1]}
    local patch=${VERSION_PARTS[2]}
    
    case $bump_type in
        "patch")
            patch=$((patch + 1))
            ;;
        "minor")
            minor=$((minor + 1))
            patch=0
            ;;
        "major")
            major=$((major + 1))
            minor=0
            patch=0
            ;;
        *)
            print_message $RED "❌ 错误: 无效的版本类型: $bump_type"
            print_message $YELLOW "支持的类型: patch, minor, major, 或具体版本号 (如: 1.2.3)"
            exit 1
            ;;
    esac
    
    echo "$major.$minor.$patch"
}

# 更新 package.json 版本
update_package_version() {
    local new_version=$1
    
    # 使用 node 脚本更新版本
    node -e "
        const fs = require('fs');
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        pkg.version = '$new_version';
        fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
    "
}

# 生成变更日志
generate_changelog() {
    local new_version=$1
    local last_tag=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
    
    print_message $BLUE "📝 生成变更日志..."
    
    if [ -n "$last_tag" ]; then
        echo "## v$new_version ($(date +%Y-%m-%d))" > CHANGELOG_NEW.md
        echo "" >> CHANGELOG_NEW.md
        git log $last_tag..HEAD --pretty=format:"- %s" --no-merges >> CHANGELOG_NEW.md
    else
        echo "## v$new_version ($(date +%Y-%m-%d))" > CHANGELOG_NEW.md
        echo "" >> CHANGELOG_NEW.md
        echo "- Initial release" >> CHANGELOG_NEW.md
    fi
    
    echo "" >> CHANGELOG_NEW.md
    
    # 如果存在旧的 CHANGELOG，则合并
    if [ -f "CHANGELOG.md" ]; then
        echo "" >> CHANGELOG_NEW.md
        cat CHANGELOG.md >> CHANGELOG_NEW.md
    fi
    
    mv CHANGELOG_NEW.md CHANGELOG.md
}

# 构建和测试
build_and_test() {
    print_message $BLUE "🔨 构建和测试..."
    
    # 安装依赖
    pnpm install --frozen-lockfile
    
    # 类型检查
    pnpm exec tsc --noEmit
    
    # 构建扩展
    pnpm build
    
    # 打包扩展
    pnpm package
    
    print_message $GREEN "✅ 构建完成"
}

# 创建 Git 标签和推送
create_tag_and_push() {
    local new_version=$1
    local tag_name="v$new_version"
    
    print_message $BLUE "🏷️  创建 Git 标签..."
    
    # 提交版本更改
    git add package.json CHANGELOG.md
    git commit -m "chore: bump version to v$new_version

🚀 Release v$new_version

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
    
    # 创建标签
    git tag -a "$tag_name" -m "Release v$new_version"
    
    # 推送到远程
    git push origin main
    git push origin "$tag_name"
    
    print_message $GREEN "✅ 标签 $tag_name 已创建并推送"
}

# 主函数
main() {
    local bump_type=${1:-"patch"}
    
    print_message $BLUE "🚀 开始版本发布流程..."
    
    # 预检查
    check_branch
    check_clean
    check_sync
    
    # 获取版本信息
    local current_version=$(get_current_version)
    local new_version=$(calculate_new_version "$current_version" "$bump_type")
    
    print_message $YELLOW "📋 版本信息:"
    print_message $YELLOW "   当前版本: $current_version"
    print_message $YELLOW "   新版本:   $new_version"
    print_message $YELLOW "   发布类型: $bump_type"
    echo ""
    
    # 确认发布
    read -p "确认发布版本 v$new_version? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_message $YELLOW "❌ 发布已取消"
        exit 0
    fi
    
    # 执行发布步骤
    update_package_version "$new_version"
    generate_changelog "$new_version"
    build_and_test
    create_tag_and_push "$new_version"
    
    print_message $GREEN "🎉 版本 v$new_version 发布成功!"
    print_message $GREEN "   GitHub Actions 将自动创建 GitHub Release"
    print_message $GREEN "   查看发布: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^.]*\).*/\1/')/releases"
}

# 显示帮助信息
show_help() {
    echo "版本发布脚本"
    echo ""
    echo "使用方法:"
    echo "  $0 [版本类型]"
    echo ""
    echo "版本类型:"
    echo "  patch     补丁版本 (默认)"
    echo "  minor     次要版本"
    echo "  major     主要版本"
    echo "  x.y.z     具体版本号"
    echo ""
    echo "示例:"
    echo "  $0           # 发布补丁版本"
    echo "  $0 patch     # 发布补丁版本"
    echo "  $0 minor     # 发布次要版本"
    echo "  $0 major     # 发布主要版本"
    echo "  $0 1.2.3     # 发布指定版本"
}

# 处理命令行参数
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    show_help
    exit 0
fi

# 检查必需的命令
command -v node >/dev/null 2>&1 || { print_message $RED "❌ 需要安装 Node.js"; exit 1; }
command -v pnpm >/dev/null 2>&1 || { print_message $RED "❌ 需要安装 pnpm"; exit 1; }
command -v git >/dev/null 2>&1 || { print_message $RED "❌ 需要安装 Git"; exit 1; }

# 执行主函数
main "$@"