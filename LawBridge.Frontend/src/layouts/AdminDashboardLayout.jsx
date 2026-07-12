import { useEffect, useState } from "react";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminTopbar from "../components/admin/AdminTopbar";
import { getAdminProfile } from "../services/adminService";
import "./AdminDashboardLayout.css";


// Shared shell for every logged-in admin page (Dashboard, Profile, ...).
// Loads the real admin from GET /api/admin/profile once and hands it down
// to the page via the `user` render-prop, same pattern as DashboardLayout.
function AdminDashboardLayout({ title, children })
{

    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [sidebarOpen, setSidebarOpen] = useState(false);


    const loadUser = async () =>
    {
        try
        {
            const data = await getAdminProfile();

            setUser(data);

            setError("");
        }
        catch (err)
        {
            setError(

                err.response?.data?.message ||
                "Could not load your admin profile. Please log in again."

            );
        }
        finally
        {
            setLoading(false);
        }
    };


    useEffect(() =>
    {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount pattern
        loadUser();

    }, []);


    return (

        <div className="admin-dashboard-shell">

            <div className={`admin-sidebar-overlay ${sidebarOpen ? "visible" : ""}`} onClick={() => setSidebarOpen(false)} />

            <AdminSidebar open={sidebarOpen} user={user} />


            <div className="admin-dashboard-main">

                <AdminTopbar
                    title={title}
                    user={user}
                    onMenuClick={() => setSidebarOpen(!sidebarOpen)}
                />

                <div className="admin-dashboard-content">

                    {loading && (

                        <div className="admin-dashboard-loading">Loading...</div>

                    )}

                    {!loading && error && (

                        <div className="admin-dashboard-error">{error}</div>

                    )}

                    {!loading && !error && typeof children === "function" &&
                        children({ user, refreshUser: loadUser })
                    }

                    {!loading && !error && typeof children !== "function" &&
                        children
                    }

                </div>

            </div>

        </div>

    );

}


export default AdminDashboardLayout;
