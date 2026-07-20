import adminApi from "../api/adminAxios";


// ===========================
// GET /api/admin/users
// returns: [{ id, name, email, preferredLanguage, isActive, createdAt }]
// ===========================
export const getUsers = async () =>
{
    const response = await adminApi.get("/admin/users");

    return response.data;
};



// ===========================
// GET /api/admin/users/{id}
// returns: { id, name, email, phoneNumber, address, preferredLanguage,
//   profileImage, isActive, createdAt, updatedAt }
// ===========================
export const getUserById = async (id) =>
{
    const response = await adminApi.get(`/admin/users/${id}`);

    return response.data;
};



// ===========================
// PUT /api/admin/users/{id}/status
// body: { isActive }
// ===========================
export const updateUserStatus = async (id, isActive) =>
{
    const response = await adminApi.put(`/admin/users/${id}/status`, { isActive });

    return response.data;
};
