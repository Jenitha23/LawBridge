import adminApi from "../api/adminAxios";


// ===========================
// GET /api/admin/profile
// returns: { id, name, email, phoneNumber, address, profileImage, preferredLanguage, role }
// ===========================
export const getAdminProfile = async () =>
{
    const response = await adminApi.get("/admin/profile");

    return response.data;
};



// ===========================
// PUT /api/admin/profile
// body: { name, phoneNumber, address, preferredLanguage }
// ===========================
export const updateAdminProfile = async (data) =>
{
    const response = await adminApi.put("/admin/profile", data);

    return response.data;
};



// ===========================
// PUT /api/admin/profile/password
// body: { currentPassword, newPassword }
// ===========================
export const changeAdminPassword = async (data) =>
{
    const response = await adminApi.put("/admin/profile/password", data);

    return response.data;
};



// ===========================
// POST /api/admin/profile/image
// file: File object from an <input type="file" />
// NOTE: the backend controller expects the multipart field to be named
// "image" (not "file" like the user upload endpoint).
// ===========================
export const uploadAdminProfileImage = async (file) =>
{
    const formData = new FormData();

    formData.append("image", file);

    const response = await adminApi.post(
        "/admin/profile/image",
        formData,
        {
            headers:
            {
                "Content-Type": "multipart/form-data"
            }
        }
    );

    return response.data;
};
