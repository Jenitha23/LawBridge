import { Navigate } from "react-router-dom";


// Decodes the JWT payload locally (no network call, no extra dependency)
// just to confirm this token actually carries the Admin role before we
// bother rendering an admin page. The backend still re-checks
// [Authorize(Roles="Admin")] on every request, so this is purely a UX
// shortcut to bounce non-admins straight back to the admin login page.
function getRoleFromToken(token)
{
    try
    {
        const payloadBase64 = token.split(".")[1];

        const payloadJson = atob(
            payloadBase64.replace(/-/g, "+").replace(/_/g, "/")
        );

        const payload = JSON.parse(payloadJson);

        return (
            payload["role"] ||
            payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
            null
        );
    }
    catch
    {
        return null;
    }
}


function AdminProtectedRoute({ children })
{

    const token = localStorage.getItem("adminToken");


    if (!token)
    {
        return <Navigate to="/admin/login" />;
    }


    const role = getRoleFromToken(token);

    if (role !== "Admin")
    {
        return <Navigate to="/admin/login" />;
    }


    return children;

}


export default AdminProtectedRoute;
