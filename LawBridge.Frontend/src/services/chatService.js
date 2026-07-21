import api from "../api/axios";


// ===========================
// POST /api/chat/ask
// body: { question, language }
// returns: { id, question, language, category, explanation,
//   relevantLegalInfo, possibleActions[], requiredDocuments[],
//   whenToConsultLawyer, sources[], createdAt }
// ===========================
export const askQuestion = async (question, language) =>
{
    const response = await api.post("/chat/ask", { question, language });

    return response.data;
};



// ===========================
// GET /api/chat/history
// returns: [{ id, question, category, language, createdAt }]
// ===========================
export const getChatHistory = async () =>
{
    const response = await api.get("/chat/history");

    return response.data;
};



// ===========================
// GET /api/chat/history/{id}
// returns full ChatAnswerDto for a past question
// ===========================
export const getChatDetail = async (id) =>
{
    const response = await api.get(`/chat/history/${id}`);

    return response.data;
};



// ===========================
// DELETE /api/chat/history/{id}
// FR-17
// ===========================
export const deleteChat = async (id) =>
{
    const response = await api.delete(`/chat/history/${id}`);

    return response.data;
};



// ===========================
// PUT /api/chat/history/{id}/save
// body: { isSaved }
// FR-15
// ===========================
export const setChatSaved = async (id, isSaved) =>
{
    const response = await api.put(`/chat/history/${id}/save`, { isSaved });

    return response.data;
};



// ===========================
// GET /api/chat/saved
// FR-16
// ===========================
export const getSavedChats = async () =>
{
    const response = await api.get("/chat/saved");

    return response.data;
};
