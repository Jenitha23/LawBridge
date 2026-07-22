import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import ChatPanel from "./ChatPanel";
import heroIllustration from "../../assets/image.png";
import { useLanguage } from "../../context/LanguageContext";
import "./Dashboard.css";


const QUICK_ACTIONS = [

    {
        titleKey: "quick_ask_title",
        descKey: "quick_ask_desc",
        path: "/dashboard?new=1",
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="#5428C7" strokeWidth="1.7" />
                <path d="M9.5 9.3a2.5 2.5 0 1 1 3.4 2.3c-.7.3-1.1.9-1.1 1.6v.3" stroke="#5428C7" strokeWidth="1.7" strokeLinecap="round" />
                <circle cx="12" cy="16.7" r="0.9" fill="#5428C7" />
            </svg>
        )
    },

    {
        titleKey: "quick_upload_title",
        descKey: "quick_upload_desc",
        path: "/documents",
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 16V6M12 6l-3.5 3.5M12 6l3.5 3.5" stroke="#5428C7" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" stroke="#5428C7" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
        )
    },

    {
        titleKey: "quick_explore_title",
        descKey: "quick_explore_desc",
        path: "/topics",
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 5.5c-1.8-1.1-4.3-1.4-6.5-.8v12.6c2.2-.6 4.7-.3 6.5.8 1.8-1.1 4.3-1.4 6.5-.8V4.7c-2.2-.6-4.7-.3-6.5.8Z" stroke="#5428C7" strokeWidth="1.7" strokeLinejoin="round" />
                <path d="M12 5.5v12.6" stroke="#5428C7" strokeWidth="1.7" />
            </svg>
        )
    }

];


const POPULAR_AREAS = [

    {
        titleKey: "area_labour_title",
        descKey: "area_labour_desc",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="8.5" cy="9" r="2.3" stroke="#5428C7" strokeWidth="1.6" />
                <circle cx="16" cy="9.5" r="1.9" stroke="#5428C7" strokeWidth="1.6" />
                <path d="M3.5 19c.6-3 2.6-4.6 5-4.6s4.4 1.6 5 4.6M13.8 14.8c2.1.1 3.7 1.6 4.2 4.2" stroke="#5428C7" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
        )
    },

    {
        titleKey: "area_tenancy_title",
        descKey: "area_tenancy_desc",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M4 11.5 12 5l8 6.5" stroke="#5428C7" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 10.5V19h12v-8.5" stroke="#5428C7" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        )
    },

    {
        titleKey: "area_consumer_title",
        descKey: "area_consumer_desc",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 4 5 6.5v5c0 4.5 3 7.5 7 8.5 4-1 7-4 7-8.5v-5L12 4Z" stroke="#5428C7" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
        )
    }

];


function Dashboard()
{

    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    const isChatMode = searchParams.get("new") === "1" || !!searchParams.get("id");

    const historyId = searchParams.get("id");

    const { t } = useLanguage();


    return (

        <DashboardLayout title={isChatMode ? t("nav_new_chat") : t("dashboard_title")}>

            {({ user }) => (

                isChatMode ? (

                    <ChatPanel historyId={historyId} user={user} />

                ) : (

                <>

                    <section className="hero-card">

                        <div className="hero-text">

                            <h1>
                                Hello, <span className="accent">{user?.name?.split(" ")[0] || "there"}!</span>
                            </h1>

                            <p>{t("dashboard_hero_question")}</p>

                        </div>


                        <div className="hero-illustration" aria-hidden="true">

                            <img src={heroIllustration} alt="" />

                        </div>

                    </section>


                    <section className="quick-actions">

                        {QUICK_ACTIONS.map((action) => (

                            <button
                                key={action.titleKey}
                                className="quick-card"
                                onClick={() => navigate(action.path)}
                            >

                                <div className="quick-icon">{action.icon}</div>

                                <h3>{t(action.titleKey)}</h3>

                                <p>{t(action.descKey)}</p>

                                <span className="quick-arrow">→</span>

                            </button>

                        ))}

                    </section>


                    <section className="popular-areas">

                        <h2>{t("popular_areas_heading")}</h2>

                        <div className="area-grid">

                            {POPULAR_AREAS.map((area) => (

                                <button
                                    key={area.titleKey}
                                    className="area-card"
                                    onClick={() => navigate("/topics")}
                                >

                                    <div className="area-icon">{area.icon}</div>

                                    <div className="area-text">

                                        <h4>{t(area.titleKey)}</h4>

                                        <p>{t(area.descKey)}</p>

                                    </div>

                                    <span className="area-arrow">→</span>

                                </button>

                            ))}

                        </div>


                        <button className="view-all-btn" onClick={() => navigate("/topics")}>
                            {t("view_all_topics")}
                        </button>

                    </section>

                </>

                )

            )}

        </DashboardLayout>

    );

}


export default Dashboard;