import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/authService";
import { getAssetUrl } from "../utils/imageUrl";
import { useLanguage } from "../context/LanguageContext";
import "./Topbar.css";


function Topbar({ title, subtitle, user, onMenuClick })
{

    const navigate = useNavigate();

    const [menuOpen, setMenuOpen] = useState(false);

    const menuRef = useRef(null);

    const { t } = useLanguage();


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
        logout();

        navigate("/login");
    };


    const avatarUrl = getAssetUrl(user?.profileImage);

    const initials = user?.name
        ? user.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
        : "";


    return (

        <header className="topbar">

            <button className="topbar-menu-btn" onClick={onMenuClick} aria-label="Toggle menu">

                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>

            </button>


            <div className="topbar-heading">

                {title && <h1>{title}</h1>}

                {subtitle && <p>{subtitle}</p>}

            </div>


            <div className="topbar-actions">

                <div className="lang-select">

                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
                        <path d="M3 12h18M12 3c2.5 2.6 2.5 15.4 0 18M12 3c-2.5 2.6-2.5 15.4 0 18" stroke="currentColor" strokeWidth="1.6" />
                    </svg>

                    <span>{user?.preferredLanguage || "English"}</span>

                </div>


                <button className="icon-btn" aria-label={t("topbar_notifications")}>

                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                        <path d="M6 10.5a6 6 0 1 1 12 0v3.7l1.6 2.8H4.4L6 14.2v-3.7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                        <path d="M10 19.5a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>

                    <span className="notif-dot" />

                </button>


                <div className="topbar-avatar-wrap" ref={menuRef}>

                    <button className="topbar-avatar-btn" onClick={() => setMenuOpen(!menuOpen)}>

                        {avatarUrl ? (

                            <img src={avatarUrl} alt={user?.name || "Profile"} className="topbar-avatar" />

                        ) : (

                            <div className="topbar-avatar topbar-avatar-fallback">{initials}</div>

                        )}

                    </button>


                    {menuOpen && (

                        <div className="topbar-dropdown">

                            <div className="topbar-dropdown-name">{user?.name}</div>

                            <div className="topbar-dropdown-email">{user?.email}</div>

                            <button onClick={() => { setMenuOpen(false); navigate("/profile"); }}>
                                {t("topbar_my_profile")}
                            </button>

                            <button onClick={handleLogout} className="danger">
                                {t("topbar_log_out")}
                            </button>

                        </div>

                    )}

                </div>

            </div>

        </header>

    );

}


export default Topbar;
