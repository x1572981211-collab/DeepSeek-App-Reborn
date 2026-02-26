# DeepSeek App Reborn

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![React 18](https://img.shields.io/badge/react-18-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)](https://fastapi.tiangolo.com/)

DeepSeek App Reborn 是一个基于 FastAPI 和 React 构建的轻量级大语言模型聊天界面。采用原生 WebSocket 实现低延迟的流式消息输出，支持包括 DeepSeek、SiliconFlow、Volcengine 在内的多种 API 提供商接入。

## ✨ 特性

- **流式响应**: 基于 WebSocket 的实时打字机效果。
- **现代化 UI**: 响应式设计，支持深浅色模式，采用 Tailwind CSS 构建。
- **会话管理**: 本地持久化存储，支持多会话隔离、新建、删除与切换。
- **Markdown 支持**: 深度集成 Markdown 渲染及代码高亮支持。
- **动态配置**: 界面内直接配置 API Key、System Prompt 及模型温度等参数。

## 📦 快速开始

### 预备环境
- Node.js 16+
- Python 3.8+

### 1. 克隆项目
```bash
git clone https://github.com/x1572981211-collab/DeepSeek-App-Reborn.git
cd DeepSeek-App-Reborn
```

### 2. Windows 用户一键启动
项目根目录下提供了便捷的启动脚本，首次运行会自动安装所有依赖：
```bash
# 双击运行或在命令行执行
启动应用.bat
```
*(注：前端默认运行于 `http://localhost:5173` 或 `5175`，后端 API 运行于 `http://localhost:8765`)*

### 3. 开箱即用的纯净压缩包 (新手推荐)
如果您不想配置 Git 环境，或者需要将开源代码发送给其他人开箱即用：
在代码主页可以直接下载 **`deepseek-app-reborn_pure_code.zip`**。
这是一个体积极小、已经剔除了所有私人 API Key、聊天历史记录和冗余环境的纯净独立源码包。解压后执行 `一键启动.bat` 即可完成本地私有部署。

### 4. 手动分步部署
如果你需要在 Linux/macOS 环境下运行，或者进行二次开发：

**启动后端服务：**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows 下使用 venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

**启动前端服务：**
```bash
cd frontend
npm install
npm run dev
```

## 📚 文档指南

更多详细说明，请参阅根目录下的专属文档：
- [使用说明](./使用说明.md) - 适合终端用户的产品使用教程与 FAQ。
- [部署指南](./部署指南.md) - 面向开发者的二次开发、Docker 部署、离线打包说明。

## 🤝 参与贡献

欢迎提交 Issue 和 Pull Request 来帮助改进此项目。
1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 📄 许可证

本项目基于 MIT 许可证开源 - 详情请查看 LICENSE 文件（如有）或遵循 MIT 协议规范。
