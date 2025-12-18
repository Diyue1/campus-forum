#!/bin/bash

echo "========================================"
echo "   校园绳网 - 绝区零风格校园论坛"
echo "========================================"
echo

echo "正在检查Node.js环境..."
if ! command -v node &> /dev/null; then
    echo "[错误] 未检测到Node.js，请先安装Node.js"
    echo "下载地址: https://nodejs.org/"
    exit 1
fi

echo "Node.js环境检查通过"
echo

echo "正在检查项目依赖..."
if [ ! -d "node_modules" ]; then
    echo "首次运行，正在安装依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "[错误] 依赖安装失败"
        exit 1
    fi
    echo "依赖安装完成"
else
    echo "依赖已存在，跳过安装"
fi

echo
echo "正在启动开发服务器..."
echo "服务器地址: http://localhost:3000"
echo "按 Ctrl+C 停止服务器"
echo

npm run dev


