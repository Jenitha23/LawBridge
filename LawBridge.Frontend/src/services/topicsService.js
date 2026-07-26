import api from "../api/axios";


// ===========================
// GET /api/topics/categories?language=...
// language is optional — when given, documentCount only reflects
// documents actually available in that language.
// returns: [{ id, name, description, documentCount }]
// ===========================
export const getTopicCategories = async (language) =>
{
    const response = await api.get("/topics/categories", { params: { language } });

    return response.data;
};



// ===========================
// GET /api/topics/categories/{id}/documents?language=...
// returns: [{ id, title, language, createdAt }]
// ===========================
export const getTopicsInCategory = async (categoryId, language) =>
{
    const response = await api.get(`/topics/categories/${categoryId}/documents`, { params: { language } });

    return response.data;
};



// ===========================
// GET /api/topics/documents/{id}
// returns: { id, title, categoryName, language, content, createdAt }
// ===========================
export const getTopicDetail = async (id) =>
{
    const response = await api.get(`/topics/documents/${id}`);

    return response.data;
};



// ===========================
// GET /api/topics/search?q=...&language=...
// Hybrid search: exact substring match merged with semantic (pgvector)
// match over the same embeddings the chat feature uses.
// returns: [{ id, title, categoryName, language, snippet, isSemanticMatch }]
// ===========================
export const searchTopics = async (query, language) =>
{
    const response = await api.get("/topics/search", { params: { q: query, language } });

    return response.data;
};