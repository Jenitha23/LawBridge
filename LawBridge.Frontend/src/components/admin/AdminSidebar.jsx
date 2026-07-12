import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { adminLogout } from "../../services/adminAuthService";
import { getAssetUrl } from "../../utils/imageUrl";
import "./AdminSidebar.css";


const NAV_GROUPS = [

    {
        heading: "Management",
        items: [

            {
                label: "Dashboard",
                path: "/admin/dashboard",
                icon: (
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                        <path d="M4 11.5 12 4l8 7.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M6 10.5V20h12v-9.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )
            },

            {
                label: "Legal Documents",
                path: "/admin/documents",
                icon: (
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                        <path d="M7 3.5h7l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                        <path d="M9 12h6M9 15.5h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                    </svg>
                )
            },

            {
                label: "Upload Document",
                path: "/admin/documents/upload",
                icon: (
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                        <path d="M12 16V6M12 6l-3.5 3.5M12 6l3.5 3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                    </svg>
                )
            },

            {
                label: "Categories",
                path: "/admin/categories",
                icon: (
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                        <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H10l2 2.5h5.5A2.5 2.5 0 0 1 20 9v8.5A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5v-11Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                    </svg>
                )
            },

            {
                label: "Users",
                path: "/admin/users",
                icon: (
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                        <circle cx="9" cy="8.3" r="3" stroke="currentColor" strokeWidth="1.7" />
                        <path d="M3.3 19c.8-3.2 3-4.8 5.7-4.8s4.9 1.6 5.7 4.8M15.3 9.3a2.6 2.6 0 1 0 0-5.2M17.6 14.6c2 .5 3.3 1.9 3.8 4.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                    </svg>
                )
            }

        ]
    },

    {
        heading: "Analytics",
        items: [

            {
                label: "Analytics",
                path: "/admin/analytics",
                icon: (
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                        <path d="M4 20V10M10 20V4M16 20v-7M20 20H4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )
            },

            {
                label: "AI Chat Logs",
                path: "/admin/chat-logs",
                icon: (
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                        <path d="M4 5.5h16v10H9l-4 3.5v-3.5H4v-10Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                    </svg>
                )
            },

            {
                label: "Feedback",
                path: "/admin/feedback",
                icon: (
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                        <path d="M6.5 4h11a1 1 0 0 1 1 1v15l-6.5-4-6.5 4V5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                    </svg>
                )
            }

        ]
    },

    {
        heading: "System",
        items: [

            {
                label: "Settings",
                path: "/admin/settings",
                icon: (
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="2.8" stroke="currentColor" strokeWidth="1.7" />
                        <path d="M12 4.5v2M12 17.5v2M19.5 12h-2M6.5 12h-2M17.3 6.7l-1.4 1.4M8.1 15.9l-1.4 1.4M17.3 17.3l-1.4-1.4M8.1 8.1 6.7 6.7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                    </svg>
                )
            }

        ]
    }

];


function AdminSidebar({ open, user })
{

    const location = useLocation();

    const navigate = useNavigate();


    const isActive = (path) => location.pathname === path;


    const handleLogout = () =>
    {
        adminLogout();

        navigate("/admin/login");
    };


    const avatarUrl = getAssetUrl(user?.profileImage);

    const initials = user?.name
        ? user.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
        : "A";


    return (

        <aside className={`admin-sidebar ${open ? "open" : ""}`}>

            <div className="admin-sidebar-brand">

                <img src={logo} alt="LawBridge logo" className="admin-brand-logo" />

                <div className="admin-brand-text">
                    <span className="admin-brand-name">LawBridge</span>
                    <span className="admin-brand-sub">Admin Panel</span>
                </div>

            </div>


            <nav className="admin-sidebar-nav">

                {NAV_GROUPS.map((group) => (

                    <div className="admin-nav-group" key={group.heading}>

                        <div className="admin-nav-heading">{group.heading}</div>

                        {group.items.map((item) => (

                            <Link
                                key={item.label}
                                to={item.path}
                                className={`admin-sidebar-link ${isActive(item.path) ? "active" : ""}`}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </Link>

                        ))}

                    </div>

                ))}

            </nav>


            <div className="admin-identity-card">

                {avatarUrl ? (

                    <img src={avatarUrl} alt={user?.name || "Admin"} className="admin-identity-avatar" />

                ) : (

                    <div className="admin-identity-avatar admin-identity-avatar-fallback">{initials}</div>

                )}

                <div className="admin-identity-text">
                    <span className="admin-identity-name">{user?.name || "LawBridge Admin"}</span>
                    <span className="admin-identity-email">{user?.email || ""}</span>
                    <span className="admin-identity-status"><i /> Online</span>
                </div>

            </div>


            <button className="admin-sidebar-logout" onClick={handleLogout}>

                <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                    <path d="M9 4.5H6a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                    <path d="M14 8l4.5 4-4.5 4M18 12H9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>

                <span>Logout</span>

            </button>

        </aside>

    );

}


export default AdminSidebar;
