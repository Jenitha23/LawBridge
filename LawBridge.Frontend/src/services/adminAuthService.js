import adminApi from "../api/adminAxios";


// ===========================
// POST /api/admin/auth/login
// body: { email, password }
// returns: { token, message }
// Backend rejects (401) unless the user's Role === "Admin".
// ===========================
export const adminLogin = async (credentials) =>
{
    const response = await adminApi.post("/admin/auth/login", credentials);

    return response.data;
};



export const adminLogout = () =>
{
    localStorage.removeItem("adminToken");
};
