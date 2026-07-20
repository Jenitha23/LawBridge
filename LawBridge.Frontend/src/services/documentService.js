import adminApi from "../api/adminAxios";


// ===========================
// GET /api/admin/documents
// returns: [{ id, title, fileName, categoryId, categoryName, language,
//   source, createdAt, status }]
// ===========================
export const getDocuments = async () =>
{
    const response = await adminApi.get("/admin/documents");

    return response.data;
};



// ===========================
// POST /api/admin/documents/upload
// multipart form: file, title, categoryId, language
// ===========================
export const uploadDocument = async ({ file, title, categoryId, language }, onUploadProgress) =>
{
    const formData = new FormData();

    formData.append("file", file);
    formData.append("title", title);
    formData.append("categoryId", categoryId);
    formData.append("language", language);

    const response = await adminApi.post(
        "/admin/documents/upload",
        formData,
        {
            headers:
            {
                "Content-Type": "multipart/form-data"
            },
            onUploadProgress
        }
    );

    return response.data;
};



// ===========================
// GET /api/admin/documents/{id}
// returns: { id, title, fileName, categoryId, categoryName, language,
//   source, createdAt, status, chunkCount, embeddedChunkCount, contentLength }
// ===========================
export const getDocumentById = async (id) =>
{
    const response = await adminApi.get(`/admin/documents/${id}`);

    return response.data;
};



// ===========================
// PUT /api/admin/documents/{id}
// body: { title, categoryId, language }
// ===========================
export const updateDocument = async (id, data) =>
{
    const response = await adminApi.put(`/admin/documents/${id}`, data);

    return response.data;
};



// ===========================
// DELETE /api/admin/documents/{id}
// ===========================
export const deleteDocument = async (id) =>
{
    const response = await adminApi.delete(`/admin/documents/${id}`);

    return response.data;
};



// ===========================
// GET /api/admin/categories
// returns: [{ id, name, description, documentCount }]
// ===========================
export const getCategories = async () =>
{
    const response = await adminApi.get("/admin/categories");

    return response.data;
};



// ===========================
// POST /api/admin/categories
// body: { name, description }
// ===========================
export const createCategory = async (data) =>
{
    const response = await adminApi.post("/admin/categories", data);

    return response.data;
};



// ===========================
// PUT /api/admin/categories/{id}
// body: { name, description }
// ===========================
export const updateCategory = async (id, data) =>
{
    const response = await adminApi.put(`/admin/categories/${id}`, data);

    return response.data;
};



// ===========================
// DELETE /api/admin/categories/{id}
// Fails with a message if documents are still assigned to the category.
// ===========================
export const deleteCategory = async (id) =>
{
    const response = await adminApi.delete(`/admin/categories/${id}`);

    return response.data;
};
