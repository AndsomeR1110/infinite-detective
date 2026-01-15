# 部署到 Vercel 指南

## 方法 1：通过 GitHub + Vercel（推荐）

### 步骤 1：创建 GitHub 仓库

1. 访问 https://github.com/new
2. 填写仓库信息：
   - Repository name: `infinite-detective`
   - Description: `赛博朋克文字冒险游戏`
   - 选择 Public 或 Private
   - **不要**勾选 "Initialize this repository with a README"（我们已经有了）
3. 点击 "Create repository"

### 步骤 2：推送代码到 GitHub

在项目目录运行：

```bash
# 添加远程仓库（替换 YOUR_USERNAME）
git remote add origin https://github.com/YOUR_USERNAME/infinite-detective.git

# 推送代码
git branch -M main
git push -u origin main
```

### 步骤 3：在 Vercel 部署

1. 访问 https://vercel.com/new
2. 点击 "Import Git Repository"
3. 选择刚才创建的 GitHub 仓库
4. Vercel 会自动检测到 Next.js 项目
5. **重要**：添加环境变量
   - 找到 "Environment Variables" 部分
   - 添加：`DEEPSEEK_API_KEY` = 你的 DeepSeek API Key
   - 获取 Key: https://platform.deepseek.com/api_keys
6. 点击 "Deploy"

等待几分钟，部署完成后会获得一个 URL，如：`https://infinite-detective.vercel.app`

---

## 方法 2：使用 Vercel CLI

### 步骤 1：安装 Vercel CLI

```bash
npm i -g vercel
```

### 步骤 2：登录 Vercel

```bash
vercel login
```

会打开浏览器，登录你的 Vercel 账号。

### 步骤 3：部署

```bash
vercel
```

按提示操作：
- Set up and deploy? Y
- Link to existing project? N
- Project name: infinite-detective
- In which directory is your code located? ./
- Want to override the settings? N
- Link to existing project? N

### 步骤 4：添加环境变量

部署后，添加 DeepSeek API Key：

```bash
vercel env add DEEPSEEK_API_KEY
```

输入你的 API Key。

### 步骤 5：重新部署

```bash
vercel --prod
```

---

## 方法 3：直接拖拽（最简单）

### 步骤 1：创建 GitHub 仓库（参考方法 1 步骤 1）

### 步骤 2：推送代码（参考方法 1 步骤 2）

### 步骤 3：在 Vercel 导入

1. 访问 https://vercel.com/new
2. 选择 GitHub
3. 选择你的仓库
4. 添加环境变量 `DEEPSEEK_API_KEY`
5. 点击 Deploy

---

## 部署后

### 访问你的网站

部署成功后，会获得一个 URL，例如：
- https://infinite-detective.vercel.app

### 自定义域名（可选）

在 Vercel 项目设置中：
- 点击 "Domains"
- 添加你的域名
- 按照提示配置 DNS

### 更新代码

修改代码后，只需：

```bash
git add .
git commit -m "Your message"
git push
```

Vercel 会自动重新部署！

---

## 常见问题

### Q: 部署失败？

检查：
1. `.env` 文件中的 API Key 是否有效
2. Vercel 环境变量是否正确设置
3. 查看部署日志（在 Vercel 项目的 "Deployments" 标签页）

### Q: API 调用失败？

确保在 Vercel 项目设置中添加了 `DEEPSEEK_API_KEY` 环境变量。

### Q: 如何查看部署日志？

1. 访问 Vercel Dashboard
2. 选择你的项目
3. 点击 "Deployments"
4. 点击最新的部署
5. 查看 "Build Log" 和 "Function Log"

### Q: 免费版限制？

Vercel 免费版：
- 100 GB 带宽/月
- 6,000 分钟构建时间/月
- 无限项目
- 自动 HTTPS
- 全球 CDN

完全足够这个项目使用！

---

## 推荐流程

**首次部署**：使用方法 1（最可靠）

**后续更新**：
```bash
git add .
git commit -m "Update game"
git push
```

Vercel 会自动检测更新并重新部署。

---

## 下一步

部署成功后，你可以：
- 分享 URL 给朋友体验
- 继续开发新功能
- 添加自定义域名
- 查看使用统计（在 Vercel Dashboard）

祝部署顺利！🚀
