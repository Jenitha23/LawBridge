import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { getProfile } from "../services/userService";
import { useLanguage } from "../context/LanguageContext";
import "./DashboardLayout.css";


// Shared shell for every logged-in page (Dashboard, Profile, ...).
// Loads the real user once from /api/users/profile and hands it down
// to the page via the `user` render-prop so pages don't each re-fetch it.
function DashboardLayout({ title, subtitle, children })
{

    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const { setLanguage } = useLanguage();


    const loadUser = async () =>
    {
        try
        {
            const data = await getProfile();

            setUser(data);

            setError("");

            if (data?.preferredLanguage)
            {
                setLanguage(data.preferredLanguage);
            }
        }
        catch (err)
        {
            setError(

                err.response?.data?.message ||
                "Could not load your profile. Please log in again."

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

        <div className="dashboard-shell">

            <div className={`sidebar-overlay ${sidebarOpen ? "visible" : ""}`} onClick={() => setSidebarOpen(false)} />

            <Sidebar open={sidebarOpen} />


            <div className="dashboard-main">

                <Topbar
                    title={title}
                    subtitle={subtitle}
                    user={user}
                    onMenuClick={() => setSidebarOpen(!sidebarOpen)}
                />

                <div className="dashboard-content">

                    {loading && (

                        <div className="dashboard-loading">Loading...</div>

                    )}

                    {!loading && error && (

                        <div className="dashboard-error">{error}</div>

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


export default DashboardLayout;
