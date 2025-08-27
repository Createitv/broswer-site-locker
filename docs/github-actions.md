# GitHub Actions 工作流说明

本项目配置了完整的 CI/CD 流水线，支持自动化构建、测试和发布。

## 🔄 工作流程

### 1. CI 工作流 (`ci.yml`)

**触发条件：**
- 推送到 `main` 或 `develop` 分支
- 向 `main` 或 `develop` 分支创建 Pull Request
- 手动触发

**执行步骤：**
1. ✅ 代码检出
2. 🔧 设置 Node.js 20 + pnpm
3. 📦 安装依赖
4. 🔍 TypeScript 类型检查
5. 🏗️ 构建扩展
6. 📋 打包扩展
7. 📊 检查扩展大小
8. 💾 上传构建产物 (仅 main 分支)

### 2. Release 工作流 (`release.yml`)

**触发条件：**
- 推送标签 (格式: `v*`，如 `v1.0.0`)
- 手动触发 (可指定版本号)

**执行步骤：**
1. ✅ 代码检出和环境设置
2. 📦 安装依赖和构建
3. 🗜️ 创建发布压缩包
   - `site-locker-vX.X.X-chrome.zip` (Chrome Web Store)
   - `site-locker-vX.X.X-firefox.zip` (Firefox, 如果存在)
4. 📝 自动生成更新日志
5. 🚀 创建 GitHub Release
6. 💾 上传构建产物

## 🛠️ 使用方法

### 方式一：使用发布脚本（推荐）

```bash
# 发布补丁版本 (0.0.1 → 0.0.2)
pnpm run release

# 发布次版本 (0.0.1 → 0.1.0)
pnpm run release:minor

# 发布主版本 (0.0.1 → 1.0.0)
pnpm run release:major

# 发布指定版本
./scripts/release.sh 1.2.3
```

发布脚本会自动：
- ✅ 检查分支和工作目录状态
- 📝 更新版本号和生成 CHANGELOG
- 🏗️ 构建和测试
- 🏷️ 创建 Git 标签
- 🚀 推送到 GitHub (触发 Release 工作流)

### 方式二：手动创建标签

```bash
# 更新版本号
git add .
git commit -m "chore: bump version to v1.0.0"

# 创建标签
git tag -a v1.0.0 -m "Release v1.0.0"

# 推送标签 (触发 Release 工作流)
git push origin v1.0.0
```

### 方式三：GitHub Actions 手动触发

1. 进入 GitHub 仓库的 **Actions** 页面
2. 选择 **Release** 工作流
3. 点击 **Run workflow**
4. 输入版本号（如 `v1.0.0`）
5. 点击 **Run workflow**

## 📋 发布产物

每次成功发布会生成：

- **GitHub Release**
  - 📝 自动生成的更新日志
  - 🗜️ Chrome 扩展压缩包
  - 🗜️ Firefox 扩展压缩包（如果支持）
  - 📦 原始构建产物

- **构建产物**
  - `build/chrome-mv3-prod/` - Chrome 扩展目录
  - `build/firefox-mv2-prod/` - Firefox 扩展目录（如果存在）
  - 各种格式的压缩包

## 🔧 高级配置

### 环境变量

- `GITHUB_TOKEN`: 自动提供，用于创建 Release
- `NODE_VERSION`: Node.js 版本 (默认 20)
- `PNPM_VERSION`: pnpm 版本 (默认 latest)

### 自定义触发条件

可修改 `.github/workflows/` 中的 YAML 文件来调整触发条件：

```yaml
on:
  push:
    branches: [ main, develop, feature/* ]
    tags: [ 'v*.*.*', 'beta-*' ]
```

### 添加通知

可以添加 Slack、Discord 或邮件通知：

```yaml
- name: Notify Slack
  if: success()
  uses: 8398a7/action-slack@v3
  with:
    status: success
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## 🛡️ 最佳实践

1. **版本号规范**: 遵循 [语义化版本](https://semver.org/lang/zh-CN/)
   - `MAJOR.MINOR.PATCH` (1.0.0)
   - 主版本.次版本.补丁版本

2. **分支策略**:
   - `main` - 生产稳定版本
   - `develop` - 开发集成分支
   - `feature/*` - 功能开发分支

3. **发布频率**:
   - 🔥 紧急修复: `patch` 版本
   - ✨ 新功能: `minor` 版本
   - 💥 破坏性变更: `major` 版本

4. **测试覆盖**:
   - 每次 CI 运行类型检查
   - 构建验证确保扩展可用
   - Release 前完整测试流程

## 🔍 故障排除

### 常见问题

1. **发布失败**: 检查标签格式是否正确 (`v*.*.*`)
2. **构建错误**: 确保 `pnpm install` 和 `pnpm build` 本地成功
3. **权限错误**: 检查 GitHub 仓库的 Actions 权限设置

### 日志查看

- GitHub Actions 页面查看详细日志
- 本地运行 `./scripts/release.sh` 查看脚本输出

---

🚀 **现在你可以使用 `pnpm run release` 轻松发布新版本！**