#!/bin/bash

# OVOGraph Notes 自动化部署脚本
# 用于构建项目并更新部署分支

echo "🚀 开始部署 OVOGraph Notes..."

# 确保在 master 分支
git checkout master

# 构建项目
echo "📦 构建项目..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败，请检查错误信息"
    exit 1
fi

echo "✅ 构建成功"

# 切换到部署分支
echo "🔄 切换到部署分支..."
git checkout noteedite

# 删除旧文件
echo "🧹 清理旧文件..."
git rm -rf dist/ server.js package.json DEPLOY.md 2>/dev/null || true

# 添加新文件
echo "📁 添加部署文件..."
git add -f dist/ server.js

# 更新 package.json
echo "📝 更新 package.json..."
cat > package.json << 'EOF'
{
  "name": "ovograph-deploy",
  "version": "1.0.0",
  "description": "OVOGraph Notes - Production Deployment",
  "type": "module",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^5.1.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF

git add package.json

# 更新部署说明
echo "📋 更新部署说明..."
cat > DEPLOY.md << 'EOF'
# 🚀 OVOGraph Notes 部署说明

## 概述

这是 OVOGraph Notes 的生产部署版本，包含已构建的前端文件和后端服务器。

## 📁 文件结构

```
├── dist/           # 构建后的前端文件
│   ├── index.html
│   └── assets/
├── server.js       # Express 后端服务器
├── package.json    # 生产环境依赖
└── DEPLOY.md       # 部署说明
```

## 🛠️ 部署步骤

### 1. 安装依赖
```bash
npm install
```

### 2. 启动服务器
```bash
npm start
```

### 3. 访问应用
- 前端应用：http://localhost:19200
- API 接口：http://localhost:19200/get-notes

## 🔧 环境配置

### 端口配置
默认端口：19200
如需修改，请编辑 `server.js` 中的端口号。

### 数据存储
- 数据文件：`data/nodeData.json`
- 自动创建数据目录

## 📱 功能特性

- ✅ 响应式设计（支持移动端）
- ✅ 触摸手势支持
- ✅ 实时笔记编辑
- ✅ 云端数据同步
- ✅ Markdown 渲染
- ✅ 树形菜单结构

## 🔒 安全说明

- 生产环境建议配置 HTTPS
- 考虑添加用户认证
- 定期备份数据文件

## 📞 技术支持

如有问题，请查看：
- 控制台错误信息
- 网络连接状态
- 数据文件权限

---

**版本**：1.0.0  
**更新时间**：2024年12月  
**Node.js 要求**：>= 18.0.0
EOF

git add DEPLOY.md

# 提交更改
echo "💾 提交更改..."
git commit -m "deploy: 更新部署文件 - $(date '+%Y-%m-%d %H:%M:%S')"

# 推送到远程仓库
echo "📤 推送到远程仓库..."
git push origin noteedite

if [ $? -eq 0 ]; then
    echo "✅ 部署成功！"
    echo "🌐 部署分支已更新：https://github.com/gamelibs/noteedite/tree/noteedite"
else
    echo "❌ 推送失败，请检查网络连接和权限"
    exit 1
fi

# 切换回 master 分支
git checkout master

echo "🎉 部署完成！"
echo ""
echo "📋 部署信息："
echo "- 远程仓库：https://github.com/gamelibs/noteedite.git"
echo "- 主分支：master（开发代码）"
echo "- 部署分支：noteedite（生产文件）"
echo ""
echo "🚀 服务器部署："
echo "1. 克隆 noteedite 分支"
echo "2. 运行 npm install"
echo "3. 运行 npm start" 