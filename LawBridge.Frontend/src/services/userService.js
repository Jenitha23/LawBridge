import api from "../api/axios";


// ===========================
// GET /api/users/profile
// ===========================
export const getProfile = async () =>
{
    const response = await api.get("/users/profile");

    return response.data;
};



// ===========================
// PUT /api/users/profile
// body: { name, phoneNumber, address, preferredLanguage }
// ===========================
export const updateProfile = async (data) =>
{
    const response = await api.put("/users/profile", data);

    return response.data;
};



// ===========================
// POST /api/users/profile-picture
// file: File object from an <input type="file" />
// ===========================
export const uploadProfilePicture = async (file) =>
{
    const formData = new FormData();

    formData.append("file", file);

    const response = await api.post(
        "/users/profile-picture",
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



// ===========================
// PUT /api/users/change-password
// body: { currentPassword, newPassword }
// ===========================
export const changePassword = async (data) =>
{
    const response = await api.put("/users/change-password", data);

    return response.data;
};
