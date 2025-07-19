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