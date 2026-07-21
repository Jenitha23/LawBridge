import api from "../api/axios";


// ===========================
// POST /api/documents/upload
// multipart form: file, title, language
// returns full UserDocumentDetailDto
// ===========================
export const uploadUserDocument = async ({ file, title, language }, onUploadProgress) =>
{
    const formData = new FormData();

    formData.append("file", file);
    formData.append("title", title);
    formData.append("language", language);

    const response = await api.post("/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress
    });

    return response.data;
};



// ===========================
// GET /api/documents
// returns: [{ id, title, fileName, fileType, language, status, createdAt }]
// ===========================
export const getUserDocuments = async () =>
{
    const response = await api.get("/documents");

    return response.data;
};



// ===========================
// GET /api/documents/{id}
// returns full UserDocumentDetailDto (extractedText, explanation, etc.)
// ===========================
export const getUserDocumentById = async (id) =>
{
    const response = await api.get(`/documents/${id}`);

    return response.data;
};
