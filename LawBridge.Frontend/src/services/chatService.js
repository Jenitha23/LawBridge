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
