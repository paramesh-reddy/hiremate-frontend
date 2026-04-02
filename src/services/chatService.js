import axiosClient from './axiosClient';

/**
 * Fetch the chat history for the current user.
 * @returns {Promise<{data: Array}>}
 */
export const getChatHistoryAPI = () => axiosClient.get('/chat');

/**
 * Send a new chat message to the AI assistant.
 * @param {string} message - The message text.
 * @returns {Promise<{data: {reply: string}}>}
 */
export const sendChatMessageAPI = (message) => axiosClient.post('/chat', { message });
