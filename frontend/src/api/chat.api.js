// src/api/chat.api.js
import API from './axios.js'

// POST /api/chat — Send message with full conversation history

// POST /api/chat/save — Save turn to MongoDB
export const saveChatTurnAPI = (sessionId, userMessage, botResponse) =>
  API.post('/api/chat/save', { sessionId, userMessage, botResponse })

// GET /api/chat/history — Load previous conversation from MongoDB
export const getChatHistoryAPI = () =>
  API.get('/api/chat/history')

// DELETE /api/chat/history/:sessionId — Clear session
export const clearChatHistoryAPI = (sessionId) =>
  API.delete(`/api/chat/history/${sessionId}`)