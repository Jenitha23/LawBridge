import api from "../api/axios";


// ===========================
// POST /api/chat/ask
// body: { question, language, history, conversationId }
// history: [{ question, explanation }] — recent turns from this
// on-screen conversation, oldest first, so the AI can use context.
// conversationId: id of the on-screen thread this question belongs to —
// omit/null on the first question of a new chat; the response returns
// the id to reuse (server-generated one) for every follow-up.
// returns: { id, conversationId, question, language, category, explanation,
//   relevantLegalInfo, possibleActions[], requiredDocuments[],
//   whenToConsultLawyer, sources[], needsClarification,
//   clarifyingQuestion, createdAt }
// ===========================
export const askQuestion = async (question, language, history = [], conversationId = null) =>
{
    const response = await api.post("/chat/ask", { question, language, history, conversationId });

    return response.data;
};



// ===========================
// GET /api/chat/history
// One row per chat thread (grouped), not per question.
// returns: [{ id, question, category, language, createdAt, messageCount }]
// (id here is the conversation id)
// ===========================
export const getChatHistory = async () =>
{
    const response = await api.get("/chat/history");

    return response.data;
};



// ===========================
// GET /api/chat/conversations/{conversationId}
// returns the full thread: an array of ChatAnswerDto, oldest first
// ===========================
export const getConversation = async (conversationId) =>
{
    const response = await api.get(`/chat/conversations/${conversationId}`);

    return response.data;
};



// ===========================
// DELETE /api/chat/conversations/{conversationId}
// Deletes an entire thread (every turn in it), not just one message.
// ===========================
export const deleteChat = async (conversationId) =>
{
    const response = await api.delete(`/chat/conversations/${conversationId}`);

    return response.data;
};



// ===========================
// PUT /api/chat/history/{id}/save
// body: { isSaved }
// FR-15 — id here is the individual message id, since a single answer
// (not a whole thread) gets saved.
// ===========================
export const setChatSaved = async (id, isSaved) =>
{
    const response = await api.put(`/chat/history/${id}/save`, { isSaved });

    return response.data;
};



// ===========================
// GET /api/chat/saved
// FR-16 — each item includes both its own message id (for unsave) and
// its conversationId (to open the full thread for context).
// ===========================
export const getSavedChats = async () =>
{
    const response = await api.get("/chat/saved");

    return response.data;
};