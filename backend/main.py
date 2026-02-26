"""
DeepSeek App Reborn - 后端主服务
FastAPI + WebSocket 实现流式响应
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import json
import os
import uuid
from datetime import datetime
import asyncio
from openai import OpenAI

# 配置文件路径
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_FILE = os.path.join(BASE_DIR, "config.json")
HISTORY_FILE = os.path.join(BASE_DIR, "history.json")

app = FastAPI(title="DeepSeek App Reborn API", version="2.0.0")

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== 数据模型 ====================

class Message(BaseModel):
    role: str
    content: str
    timestamp: Optional[str] = None

class Session(BaseModel):
    id: str
    title: str
    created_at: str
    updated_at: str
    messages: List[Message] = []
    config: Optional[Dict[str, Any]] = None

class Config(BaseModel):
    api_key_deepseek: str = ""
    api_key_siliconflow: str = ""
    api_key_volcengine: str = ""
    provider: str = "DeepSeek Official"
    base_url: str = "https://api.deepseek.com"
    model: str = "deepseek-chat"
    max_tokens: int = 4096
    temperature: float = 1.0
    system_prompt: str = "你是一个乐于助人的 AI 助手。"
    context_limit: int = 20
    theme: str = "dark"

class ChatRequest(BaseModel):
    session_id: str
    message: str
    config: Dict[str, Any]

# ==================== 数据存储 ====================

def load_config() -> Config:
    """加载配置"""
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                return Config(**data)
        except:
            pass
    return Config()

def save_config(config: Config):
    """保存配置"""
    with open(CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump(config.dict(), f, ensure_ascii=False, indent=2)

def load_history() -> Dict[str, Session]:
    """加载历史记录"""
    if os.path.exists(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                sessions = {}
                for sid, sdata in data.get("sessions", {}).items():
                    sessions[sid] = Session(**sdata)
                return sessions
        except Exception as e:
            print(f"加载历史失败: {e}")
    
    # 创建默认会话
    default_id = str(uuid.uuid4())
    default_session = Session(
        id=default_id,
        title="新对话",
        created_at=datetime.now().isoformat(),
        updated_at=datetime.now().isoformat(),
        messages=[]
    )
    return {default_id: default_session}

async def save_history_async(sessions: Dict[str, Session]):
    """异步保存历史记录，防止阻塞主线程"""
    def _save():
        data = {
            "version": 2,
            "sessions": {sid: s.dict() for sid, s in sessions.items()}
        }
        try:
            with open(HISTORY_FILE, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"保存历史记录失败: {e}")
    
    await asyncio.to_thread(_save)

def save_history(sessions: Dict[str, Session]):
    """同步保存（仅限启动和非异步上下文）"""
    data = {
        "version": 2,
        "sessions": {sid: s.dict() for sid, s in sessions.items()}
    }
    with open(HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# 全局变量
sessions_db = load_history()
config_db = load_config()

# ==================== API 路由 ====================

@app.get("/")
async def root():
    return {"message": "DeepSeek App Reborn API", "version": "2.0.0"}

@app.get("/api/config")
async def get_config():
    """获取配置"""
    return config_db.dict()

@app.post("/api/config")
async def update_config(config: Config):
    """更新配置"""
    global config_db
    config_db = config
    save_config(config)
    return {"status": "success"}

@app.get("/api/sessions")
async def get_sessions():
    """获取所有会话（仅元数据，不包含具体消息，优化性能）"""
    metadata_sessions = []
    for sid, s in sessions_db.items():
        metadata = s.dict(exclude={"messages"})
        # 附加消息数量
        metadata["message_count"] = len(s.messages)
        metadata_sessions.append(metadata)
        
    return {
        "sessions": metadata_sessions,
        "total": len(sessions_db)
    }

@app.get("/api/sessions/{session_id}")
async def get_session(session_id: str):
    """获取指定会话"""
    if session_id not in sessions_db:
        raise HTTPException(status_code=404, detail="会话不存在")
    return sessions_db[session_id].dict()

@app.get("/api/sessions/{session_id}/messages")
async def get_session_messages(session_id: str):
    """获取指定会话的所有消息"""
    if session_id not in sessions_db:
        raise HTTPException(status_code=404, detail="会话不存在")
    return {"messages": [m.dict() for m in sessions_db[session_id].messages]}

@app.put("/api/sessions/{session_id}/config")
async def update_session_config(session_id: str, config: Dict[str, Any]):
    """更新会话专属配置"""
    if session_id not in sessions_db:
        raise HTTPException(status_code=404, detail="会话不存在")
    
    sessions_db[session_id].config = config
    sessions_db[session_id].updated_at = datetime.now().isoformat()
    await save_history_async(sessions_db)
    return {"status": "success"}

@app.put("/api/sessions/{session_id}/messages")
async def update_session_messages(session_id: str, messages: List[Message]):
    """覆盖更新会话的消息（用于撤回功能）"""
    if session_id not in sessions_db:
        raise HTTPException(status_code=404, detail="会话不存在")
    
    sessions_db[session_id].messages = messages
    sessions_db[session_id].updated_at = datetime.now().isoformat()
    await save_history_async(sessions_db)
    return {"status": "success"}

@app.post("/api/sessions")
async def create_session():
    """创建新会话"""
    new_id = str(uuid.uuid4())
    new_session = Session(
        id=new_id,
        title=f"新对话 {datetime.now().strftime('%H:%M:%S')}",
        created_at=datetime.now().isoformat(),
        updated_at=datetime.now().isoformat(),
        messages=[],
        config=None
    )
    sessions_db[new_id] = new_session
    await save_history_async(sessions_db)
    return new_session.dict()

@app.delete("/api/sessions/{session_id}")
async def delete_session(session_id: str):
    """删除会话"""
    if session_id not in sessions_db:
        raise HTTPException(status_code=404, detail="会话不存在")
    
    if len(sessions_db) <= 1:
        # 最后一个会话，只清空消息
        sessions_db[session_id].messages = []
        sessions_db[session_id].updated_at = datetime.now().isoformat()
    else:
        del sessions_db[session_id]
    
    await save_history_async(sessions_db)
    return {"status": "success"}

@app.put("/api/sessions/{session_id}/title")
async def update_session_title(session_id: str, title: str):
    """更新会话标题"""
    if session_id not in sessions_db:
        raise HTTPException(status_code=404, detail="会话不存在")
    
    sessions_db[session_id].title = title
    sessions_db[session_id].updated_at = datetime.now().isoformat()
    await save_history_async(sessions_db)
    return {"status": "success"}

@app.post("/api/sessions/{session_id}/messages")
async def add_message(session_id: str, message: Message):
    """添加消息到会话"""
    if session_id not in sessions_db:
        raise HTTPException(status_code=404, detail="会话不存在")
    
    message.timestamp = datetime.now().isoformat()
    sessions_db[session_id].messages.append(message)
    sessions_db[session_id].updated_at = datetime.now().isoformat()
    await save_history_async(sessions_db)
    return {"status": "success"}

# ==================== WebSocket 流式聊天 ====================

@app.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket):
    """WebSocket 流式聊天"""
    await websocket.accept()
    
    try:
        while True:
            # 接收客户端消息
            data = await websocket.receive_json()
            session_id = data.get("session_id")
            user_message = data.get("message")
            config = data.get("config", {})
            
            if not session_id or not user_message:
                await websocket.send_json({
                    "type": "error",
                    "content": "缺少必要参数"
                })
                continue
            
            if session_id not in sessions_db:
                await websocket.send_json({
                    "type": "error",
                    "content": "会话不存在"
                })
                continue
            
            # 添加用户消息
            user_msg = Message(
                role="user",
                content=user_message,
                timestamp=datetime.now().isoformat()
            )
            sessions_db[session_id].messages.append(user_msg)
            
            # 发送确认
            await websocket.send_json({
                "type": "user_message_saved",
                "content": user_message
            })
            
            # 准备 AI 响应
            try:
                # 获取配置
                api_key = config.get("api_key", "")
                base_url = config.get("base_url", "https://api.deepseek.com")
                model = config.get("model", "deepseek-chat")
                max_tokens = config.get("max_tokens", 4096)
                temperature = config.get("temperature", 1.0)
                system_prompt = config.get("system_prompt", "你是一个乐于助人的 AI 助手。")
                context_limit = config.get("context_limit", 20)
                
                # 构建消息历史
                messages = [{"role": "system", "content": system_prompt}]
                
                # 获取上下文
                history = sessions_db[session_id].messages[:-1]  # 排除刚添加的用户消息
                if context_limit > 0 and len(history) > context_limit:
                    history = history[-context_limit:]
                
                for msg in history:
                    messages.append({"role": msg.role, "content": msg.content})
                
                # 添加当前用户消息
                messages.append({"role": "user", "content": user_message})
                
                # 调用 OpenAI API（确保不传递 proxies 参数）
                client = OpenAI(
                    api_key=api_key, 
                    base_url=base_url,
                    timeout=60.0,  # 设置超时
                    max_retries=2   # 设置重试次数
                )
                
                response = client.chat.completions.create(
                    model=model,
                    messages=messages,
                    max_tokens=max_tokens,
                    temperature=temperature,
                    stream=True
                )
                
                # 流式发送响应
                full_content = ""
                has_reasoning = False
                
                for chunk in response:
                    delta = chunk.choices[0].delta
                    delta_content = ""
                    
                    # 处理推理内容
                    if hasattr(delta, 'reasoning_content') and delta.reasoning_content:
                        if not has_reasoning:
                            delta_content += "【深度思考】\n"
                            has_reasoning = True
                        delta_content += delta.reasoning_content
                    
                    # 处理正常内容
                    if delta.content:
                        if has_reasoning and "\n\n---\n\n" not in full_content:
                            delta_content += "\n\n---\n\n"
                        delta_content += delta.content
                    
                    if delta_content:
                        full_content += delta_content
                        
                        # 发送流式数据
                        await websocket.send_json({
                            "type": "stream",
                            "content": delta_content
                        })
                
                # 保存 AI 响应
                ai_msg = Message(
                    role="assistant",
                    content=full_content,
                    timestamp=datetime.now().isoformat()
                )
                sessions_db[session_id].messages.append(ai_msg)
                sessions_db[session_id].updated_at = datetime.now().isoformat()
                await save_history_async(sessions_db)
                
                # 发送完成信号
                await websocket.send_json({
                    "type": "done",
                    "content": full_content
                })
                
            except Exception as e:
                error_msg = f"API 调用失败: {str(e)}"
                await websocket.send_json({
                    "type": "error",
                    "content": error_msg
                })
                
                # 保存错误消息
                error_msg_obj = Message(
                    role="system",
                    content=f"❌ {error_msg}",
                    timestamp=datetime.now().isoformat()
                )
                sessions_db[session_id].messages.append(error_msg_obj)
                await save_history_async(sessions_db)
    
    except WebSocketDisconnect:
        print("WebSocket 连接断开")
    except Exception as e:
        print(f"WebSocket 错误: {e}")

# ==================== 启动服务 ====================

if __name__ == "__main__":
    import uvicorn
    import sys
    
    # 强制将标准输出和标准错误设置为 UTF-8 (以修复 Windows 在非 UTF-8 终端上打印 emoji 崩溃的问题)
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

    print("🚀 DeepSeek App Reborn 后端启动中...")
    print("📡 API 文档: http://localhost:8765/docs")
    print("🔌 WebSocket: ws://localhost:8765/ws/chat")
    uvicorn.run(app, host="0.0.0.0", port=8765, log_level="info")





