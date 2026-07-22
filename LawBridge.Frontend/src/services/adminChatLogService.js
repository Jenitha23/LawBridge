import adminApi from "../api/adminAxios";


// ===========================
// GET /api/admin/chat-logs?search=&category=
// returns: [{ id, userName, userEmail, question, category, language, createdAt }]
// ===========================
export const getChatLogs = async ({ search, category } = {}) =>
{
    const response = await adminApi.get("/admin/chat-logs", {
        params: { search: search || undefined, category: category || undefined }
    });

    return response.data;
};



// ===========================
// GET /api/admin/chat-logs/{id}
// returns full detail incl. explanation, actions, documents, sources
// ===========================
export const getChatLogDetail = async (id) =>
{
    const response = await adminApi.get(`/admin/chat-logs/${id}`);

    return response.data;
};
