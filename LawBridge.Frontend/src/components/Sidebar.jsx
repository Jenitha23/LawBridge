import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { logout } from "../services/authService";
import "./Sidebar.css";


const NAV_ITEMS = [

    {
        label: "Dashboard",
        path: "/dashboard",
        icon: (
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                <path d="M4 11.5 12 4l8 7.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 10.5V20h12v-9.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        )
    },

    {
        label: "New Chat",
        path: "/dashboard?new=1",
        icon: (
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                <path d="M21 11.5a8.5 8.5 0 1 1-3.9-7.1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                <path d="M4 20l1.2-4.2L14 7l3 3-8.8 8.8L4 20Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
            </svg>
        )
    },

    {
        label: "My Chats",
        path: "/chats",
        icon: (
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                <path d="M4 5.5h16v10H9l-4 3.5v-3.5H4v-10Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
            </svg>
        )
    },

    {
        label: "My Documents",
        path: "/documents",
        icon: (
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                <path d="M7 3.5h7l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                <path d="M9 12h6M9 15.5h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
        )
    },

    {
        label: "Legal Topics",
        path: "/topics",
        icon: (
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                <path d="M12 5.5c-1.8-1.1-4.3-1.4-6.5-.8v12.6c2.2-.6 4.7-.3 6.5.8 1.8-1.1 4.3-1.4 6.5-.8V4.7c-2.2-.6-4.7-.3-6.5.8Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                <path d="M12 5.5v12.6" stroke="currentColor" strokeWidth="1.7" />
            </svg>
        )
    },

    {
        label: "Saved Answers",
        path: "/saved",
        icon: (
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                <path d="M6.5 4h11a1 1 0 0 1 1 1v15l-6.5-4-6.5 4V5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
            </svg>
        )
    }

];


const NAV_ITEMS_BOTTOM = [

    {
        label: "Profile",
        path: "/profile",
        icon: (
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="3.6" stroke="currentColor" strokeWidth="1.7" />
                <path d="M4.8 19.5c1-3.4 4-5 7.2-5s6.2 1.6 7.2 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
        )
    },

    {
        label: "Settings",
        path: "/settings",
        icon: (
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="2.8" stroke="currentColor" strokeWidth="1.7" />
                <path d="M12 4.5v2M12 17.5v2M19.5 12h-2M6.5 12h-2M17.3 6.7l-1.4 1.4M8.1 15.9l-1.4 1.4M17.3 17.3l-1.4-1.4M8.1 8.1 6.7 6.7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
        )
    }

];


function Sidebar({ open })
{

    const location = useLocation();

    const navigate = useNavigate();


    const isActive = (path) =>
    {
        const basePath = path.split("?")[0];

        return location.pathname === basePath;
    };


    const handleLogout = () =>
    {
        logout();

        navigate("/login");
    };


    return (

        <aside className={`sidebar ${open ? "open" : ""}`}>

            <div className="sidebar-brand">

                <img src={logo} alt="LawBridge logo" className="brand-logo" />

                <span>LawBridge</span>

            </div>


            <nav className="sidebar-nav">

                {NAV_ITEMS.map((item) => (

                    <Link
                        key={item.label}
                        to={item.path}
                        className={`sidebar-link ${isActive(item.path) ? "active" : ""}`}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </Link>

                ))}

            </nav>


            <div className="sidebar-divider" />


            <nav className="sidebar-nav">

                {NAV_ITEMS_BOTTOM.map((item) => (

                    <Link
                        key={item.label}
                        to={item.path}
                        className={`sidebar-link ${isActive(item.path) ? "active" : ""}`}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </Link>

                ))}


                <button className="sidebar-link sidebar-logout" onClick={handleLogout}>

                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                        <path d="M9 4.5H6a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                        <path d="M14 8l4.5 4-4.5 4M18 12H9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>

                    <span>Log Out</span>

                </button>

            </nav>

        </aside>

    );

}


export default Sidebar;
