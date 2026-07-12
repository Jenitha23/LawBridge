import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogout } from "../../services/adminAuthService";
import { getAssetUrl } from "../../utils/imageUrl";
import "./AdminTopbar.css";


function AdminTopbar({ title, user, onMenuClick })
{

    const navigate = useNavigate();

    const [menuOpen, setMenuOpen] = useState(false);

    const menuRef = useRef(null);


    useEffect(() =>
    {
        const handleClickOutside = (e) =>
        {
            if (menuRef.current && !menuRef.current.contains(e.target))
            {
                setMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => document.removeEventListener("mousedown", handleClickOutside);

    }, []);


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

        <header className="admin-topbar">

            <button className="admin-topbar-menu-btn" onClick={onMenuClick} aria-label="Toggle menu">

                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>

            </button>


            <div className="admin-topbar-heading">

                <h1>{title}</h1>

            </div>


            <div className="admin-topbar-actions">

                <button className="admin-icon-btn" aria-label="Notifications">

                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                        <path d="M6 10.5a6 6 0 1 1 12 0v3.7l1.6 2.8H4.4L6 14.2v-3.7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                        <path d="M10 19.5a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>

                    <span className="admin-notif-badge">3</span>

                </button>


                <div className="admin-topbar-avatar-wrap" ref={menuRef}>

                    <button className="admin-topbar-avatar-btn" onClick={() => setMenuOpen(!menuOpen)}>

                        {avatarUrl ? (

                            <img src={avatarUrl} alt={user?.name || "Admin"} className="admin-topbar-avatar" />

                        ) : (

                            <div className="admin-topbar-avatar admin-topbar-avatar-fallback">{initials}</div>

                        )}

                        <div className="admin-topbar-name-block">
                            <span className="admin-topbar-name">{user?.name || "LawBridge Admin"}</span>
                            <span className="admin-topbar-role">Administrator</span>
                        </div>

                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="admin-caret">
                            <path d="M6 9.5 12 15l6-5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>

                    </button>


                    {menuOpen && (

                        <div className="admin-topbar-dropdown">

                            <div className="admin-topbar-dropdown-name">{user?.name}</div>

                            <div className="admin-topbar-dropdown-email">{user?.email}</div>

                            <button onClick={() => { setMenuOpen(false); navigate("/admin/profile"); }}>
                                My Profile
                            </button>

                            <button onClick={handleLogout} className="danger">
                                Log Out
                            </button>

                        </div>

                    )}

                </div>

            </div>

        </header>

    );

}


export default AdminTopbar;
