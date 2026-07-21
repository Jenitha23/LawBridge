import api from "../api/axios";


// ===========================
// GET /api/topics/categories
// returns: [{ id, name, description, documentCount }]
// ===========================
export const getTopicCategories = async () =>
{
    const response = await api.get("/topics/categories");

    return response.data;
};



// ===========================
// GET /api/topics/categories/{id}/documents
// returns: [{ id, title, language, createdAt }]
// ===========================
export const getTopicsInCategory = async (categoryId) =>
{
    const response = await api.get(`/topics/categories/${categoryId}/documents`);

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
// GET /api/topics/search?q=...
// returns: [{ id, title, categoryName, language, snippet }]
// ===========================
export const searchTopics = async (query) =>
{
    const response = await api.get("/topics/search", { params: { q: query } });

    return response.data;
};
