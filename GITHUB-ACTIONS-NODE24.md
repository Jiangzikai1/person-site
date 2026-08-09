# GitHub Actions Node.js 24 说明

如果仓库的 GitHub Actions 日志出现：

`Node.js 20 is deprecated. ... actions/checkout@v4 ... actions/upload-artifact@v4`

这是仓库现有 workflow 使用旧版 Action 的提示，不是网站 HTML/CSS/JS 的运行错误。

当前 GitHub 官方 Action 已提供 Node.js 24 版本：

- `actions/checkout@v6`
- `actions/upload-artifact@v6` 或更新版本
- 如果使用 GitHub Pages：`actions/configure-pages@v6`、`actions/upload-pages-artifact@v5`、`actions/deploy-pages@v5`

把现有 workflow 中对应的旧版本升级即可。不要同时创建第二套 Pages workflow，否则可能出现重复部署。
