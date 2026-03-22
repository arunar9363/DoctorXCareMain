// src/api/chat.api.js
import API from './axios.js'

// POST /api/chat — Send message with full conversation history
// payload: { message, systemPrompt, history: [], sessionId }
export const sendChatMessageAPI = (payload) =>
  API.post('/chat', payload)

// POST /api/chat/save — Save turn to MongoDB
export const saveChatTurnAPI = (sessionId, userMessage, botResponse) =>
  API.post('/chat/save', { sessionId, userMessage, botResponse })

// GET /api/chat/history — Load previous conversation from MongoDB
export const getChatHistoryAPI = () =>
  API.get('/chat/history')

// DELETE /api/chat/history/:sessionId — Clear session
export const clearChatHistoryAPI = (sessionId) =>
  API.delete(`/chat/history/${sessionId}`)