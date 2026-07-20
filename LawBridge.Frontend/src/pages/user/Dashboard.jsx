import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import ChatPanel from "./ChatPanel";
import heroIllustration from "../../assets/image.png";
import "./Dashboard.css";


const QUICK_ACTIONS = [

    {
        title: "Ask a Legal Question",
        description: "Get clear, reliable answers to your legal questions in simple terms.",
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
        title: "Upload a Document",
        description: "Upload your legal documents and get AI-powered insights instantly.",
        path: "/documents",
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 16V6M12 6l-3.5 3.5M12 6l3.5 3.5" stroke="#5428C7" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" stroke="#5428C7" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
        )
    },

    {
        title: "Explore Legal Topics",
        description: "Browse trusted legal information on a wide range of topics.",
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
        title: "Labour Law",
        description: "Learn about employee rights, employer obligations, contracts, and workplace disputes.",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="8.5" cy="9" r="2.3" stroke="#5428C7" strokeWidth="1.6" />
                <circle cx="16" cy="9.5" r="1.9" stroke="#5428C7" strokeWidth="1.6" />
                <path d="M3.5 19c.6-3 2.6-4.6 5-4.6s4.4 1.6 5 4.6M13.8 14.8c2.1.1 3.7 1.6 4.2 4.2" stroke="#5428C7" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
        )
    },

    {
        title: "Tenancy Law",
        description: "Understand lease agreements, rent rights, eviction rules, and tenant protections.",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M4 11.5 12 5l8 6.5" stroke="#5428C7" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 10.5V19h12v-8.5" stroke="#5428C7" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        )
    },

    {
        title: "Consumer Protection",
        description: "Know your rights as a consumer and how to resolve disputes fairly.",
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


    return (

        <DashboardLayout title={isChatMode ? "New Chat" : "Dashboard"}>

            {({ user }) => (

                isChatMode ? (

                    <ChatPanel historyId={historyId} />

                ) : (

                <>

                    <section className="hero-card">

                        <div className="hero-text">

                            <h1>
                                Hello, <span className="accent">{user?.name?.split(" ")[0] || "there"}!</span>
                            </h1>

                            <p>How can we help you today?</p>

                        </div>


                        <div className="hero-illustration" aria-hidden="true">

                            <img src={heroIllustration} alt="" />

                        </div>

                    </section>


                    <section className="quick-actions">

                        {QUICK_ACTIONS.map((action) => (

                            <button
                                key={action.title}
                                className="quick-card"
                                onClick={() => navigate(action.path)}
                            >

                                <div className="quick-icon">{action.icon}</div>

                                <h3>{action.title}</h3>

                                <p>{action.description}</p>

                                <span className="quick-arrow">→</span>

                            </button>

                        ))}

                    </section>


                    <section className="popular-areas">

                        <h2>Popular Legal Areas</h2>

                        <div className="area-grid">

                            {POPULAR_AREAS.map((area) => (

                                <button
                                    key={area.title}
                                    className="area-card"
                                    onClick={() => navigate("/topics")}
                                >

                                    <div className="area-icon">{area.icon}</div>

                                    <div className="area-text">

                                        <h4>{area.title}</h4>

                                        <p>{area.description}</p>

                                    </div>

                                    <span className="area-arrow">→</span>

                                </button>

                            ))}

                        </div>


                        <button className="view-all-btn" onClick={() => navigate("/topics")}>
                            View All Topics
                        </button>

                    </section>

                </>

                )

            )}

        </DashboardLayout>

    );

}


export default Dashboard;