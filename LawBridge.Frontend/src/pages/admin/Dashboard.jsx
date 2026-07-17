import { useEffect, useState } from "react";
import AdminDashboardLayout from "../../layouts/AdminDashboardLayout";
import { getDashboardStats } from "../../services/adminService";
import "./Dashboard.css";


// Category donut palette - cycles if there are more categories than colors.
const CATEGORY_COLORS = ["#4F32C4", "#16A34A", "#F59E0B", "#7C5CFA", "#0EA5E9", "#DB2777"];


function tagClass(tag)
{
    if (tag === "Labour Laws") return "tag tag-purple";

    if (tag === "Tenancy Laws") return "tag tag-green";

    return "tag tag-orange";
}


function timeAgo(dateString)
{
    const then = new Date(dateString);

    const diffMs = Date.now() - then.getTime();

    const mins = Math.floor(diffMs / 60000);

    if (mins < 60) return `${Math.max(mins, 0)} min ago`;

    const hours = Math.floor(mins / 60);

    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

    const days = Math.floor(hours / 24);

    return `${days} day${days === 1 ? "" : "s"} ago`;
}


function Dashboard()
{

    const [stats, setStats] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    useEffect(() =>
    {
        const loadStats = async () =>
        {
            try
            {
                const data = await getDashboardStats();

                setStats(data);

                setError("");
            }
            catch (err)
            {
                setError(
                    err.response?.data?.message ||
                    "Could not load dashboard stats."
                );
            }
            finally
            {
                setLoading(false);
            }
        };

        // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount pattern
        loadStats();

    }, []);


    const today = new Date();

    const dateLabel = today.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

    const weekdayLabel = today.toLocaleDateString("en-US", { weekday: "long" });


    const statCards = stats ? [
        { label: "Total Documents", value: stats.totalDocuments.toLocaleString(), sub: "All legal documents", color: "purple", icon: <DocIcon /> },
        { label: "Storage Used", value: `${stats.storageUsedMB} MB`, sub: "Total system storage", color: "green", icon: <StorageIcon /> },
        { label: "Total Users", value: stats.totalUsers.toLocaleString(), sub: "Registered users", color: "blue", icon: <UsersIcon /> },
        {
            label: "AI Chat Sessions",
            value: stats.chatSessionsTracked ? stats.totalChatSessions.toLocaleString() : "—",
            sub: stats.chatSessionsTracked ? "This month" : "Not tracked yet",
            color: "violet",
            icon: <ChatIcon />
        }
    ] : [];


    const categoryBreakdown = (stats?.categoryBreakdown || []).map((c, i) => ({
        name: c.name,
        count: c.count,
        percent: c.percent,
        color: CATEGORY_COLORS[i % CATEGORY_COLORS.length]
    }));


    const registrationValues = (stats?.registrationTrend || []).map((p) => p.count);

    const registrationLabels = (stats?.registrationTrend || []).map((p) =>
        new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    );


    return (

        <AdminDashboardLayout title="Admin Dashboard">

            {({ user }) => (

                <>

                    {loading && (
                        <div className="admin-dashboard-loading">Loading dashboard stats...</div>
                    )}

                    {!loading && error && (
                        <div className="admin-dashboard-error">{error}</div>
                    )}

                    {!loading && !error && stats && (

                        <>

                            <section className="admin-welcome-card">

                                <div className="admin-welcome-text">

                                    <h1>Welcome back, {user?.name?.split(" ")[0] || "Admin"}! 👋</h1>

                                    <p>Here's what's happening with your LawBridge system today.</p>

                                </div>

                                <div className="admin-date-card">

                                    <CalendarIcon />

                                    <div>
                                        <div className="admin-date-value">{dateLabel}</div>
                                        <div className="admin-date-sub">{weekdayLabel}</div>
                                    </div>

                                </div>

                            </section>


                            <section className="admin-stats-grid">

                                {statCards.map((stat) => (

                                    <div className="admin-stat-card" key={stat.label}>

                                        <div className={`admin-stat-icon icon-${stat.color}`}>{stat.icon}</div>

                                        <div className="admin-stat-value">{stat.value}</div>

                                        <div className="admin-stat-label">{stat.label}</div>

                                        <div className="admin-stat-sub">{stat.sub}</div>

                                    </div>

                                ))}

                            </section>


                            <section className="admin-mid-grid">

                                <div className="admin-panel">

                                    <div className="admin-panel-header">
                                        <h3>Documents by Category</h3>
                                    </div>

                                    {categoryBreakdown.length > 0 ? (

                                        <div className="donut-row">

                                            <DonutChart segments={categoryBreakdown} />

                                            <ul className="donut-legend">

                                                {categoryBreakdown.map((c) => (

                                                    <li key={c.name}>
                                                        <i style={{ background: c.color }} />
                                                        <div>
                                                            <div className="legend-name">{c.name}</div>
                                                            <div className="legend-count">{c.count} documents</div>
                                                        </div>
                                                    </li>

                                                ))}

                                            </ul>

                                        </div>

                                    ) : (

                                        <p className="admin-panel-muted">No documents uploaded yet.</p>

                                    )}

                                </div>


                                <div className="admin-panel">

                                    <div className="admin-panel-header">
                                        <h3>Recent Documents</h3>
                                    </div>

                                    {stats.recentDocuments.length > 0 ? (

                                        <ul className="doc-list">

                                            {stats.recentDocuments.map((doc) => (

                                                <li key={doc.title + doc.createdAt}>

                                                    <div className="doc-list-icon"><PdfIcon /></div>

                                                    <div className="doc-list-name">{doc.title}</div>

                                                    <span className={tagClass(doc.categoryName)}>{doc.categoryName}</span>

                                                    <span className="doc-list-time">{timeAgo(doc.createdAt)}</span>

                                                </li>

                                            ))}

                                        </ul>

                                    ) : (

                                        <p className="admin-panel-muted">No documents uploaded yet.</p>

                                    )}

                                </div>

                            </section>


                            <section className="admin-bottom-grid">

                                <div className="admin-panel">

                                    <div className="admin-panel-header">
                                        <h3>AI Chat Sessions</h3>
                                    </div>

                                    <p className="admin-panel-muted">
                                        Chat session analytics aren't tracked yet — this needs a
                                        chat-session table on the backend.
                                    </p>

                                </div>


                                <div className="admin-panel">

                                    <div className="admin-panel-header">
                                        <h3>Top Viewed Documents</h3>
                                    </div>

                                    <p className="admin-panel-muted">
                                        Document view counts aren't tracked yet — this needs a
                                        view-count field on the backend.
                                    </p>

                                </div>


                                <div className="admin-panel">

                                    <div className="admin-panel-header">
                                        <h3>User Registrations</h3>
                                        <span className="admin-panel-muted">Last 12 Days</span>
                                    </div>

                                    <BarChart
                                        values={registrationValues}
                                        labels={registrationLabels}
                                    />

                                </div>

                            </section>

                        </>

                    )}

                </>

            )}

        </AdminDashboardLayout>

    );

}


// ================= Chart components (plain SVG, no chart library dependency) =================

function DonutChart({ segments })
{

    const size = 180;

    const stroke = 34;

    const radius = (size - stroke) / 2;

    const circumference = 2 * Math.PI * radius;

    const offsets = segments.reduce((acc, seg) => {

        const prevEnd = acc.length > 0 ? acc[acc.length - 1].end : 0;

        const segLength = (seg.percent / 100) * circumference;

        acc.push({ start: prevEnd, end: prevEnd + segLength, segLength });

        return acc;

    }, []);


    return (

        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="donut-chart">

            <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>

                {segments.map((seg, i) => {

                    const { segLength, start } = offsets[i];

                    const dashArray = `${segLength} ${circumference - segLength}`;

                    const dashOffset = -start;

                    return (

                        <circle
                            key={seg.name}
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke={seg.color}
                            strokeWidth={stroke}
                            strokeDasharray={dashArray}
                            strokeDashoffset={dashOffset}
                        />

                    );

                })}

            </g>

            <text x="50%" y="47%" textAnchor="middle" className="donut-center-value">
                {segments.reduce((sum, s) => sum + s.count, 0)}
            </text>

            <text x="50%" y="59%" textAnchor="middle" className="donut-center-label">
                documents
            </text>

        </svg>

    );

}


function BarChart({ values, labels })
{

    const width = 480;

    const height = 180;

    const padding = 24;

    const max = values.length > 0 ? Math.max(...values, 1) * 1.15 : 1;

    const barGap = 6;

    const barWidth = values.length > 0 ? (width - padding * 2) / values.length - barGap : 0;


    return (

        <svg width="100%" viewBox={`0 0 ${width} ${height + 22}`} className="bar-chart">

            {values.map((v, i) => {

                const barHeight = (v / max) * (height - padding);

                const x = padding + i * ((width - padding * 2) / values.length);

                const y = height - barHeight;

                return (

                    <rect
                        key={i}
                        x={x}
                        y={y}
                        width={barWidth}
                        height={barHeight}
                        rx="4"
                        fill="var(--primary-light)"
                    />

                );

            })}

            {labels.map((l, i) => {

                if (i % 2 !== 0) return null;

                const x = padding + i * ((width - padding * 2) / values.length) + barWidth / 2;

                return (
                    <text key={l} x={x} y={height + 18} textAnchor="middle" className="chart-axis-label">
                        {l}
                    </text>
                );

            })}

        </svg>

    );

}


// ================= Icons =================

function DocIcon() { return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M7 3.5h7l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><path d="M9 12h6M9 15.5h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>); }

function StorageIcon() { return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="6" rx="8" ry="3" stroke="currentColor" strokeWidth="1.7" /><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>); }

function UsersIcon() { return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="8.3" r="3" stroke="currentColor" strokeWidth="1.7" /><path d="M3.3 19c.8-3.2 3-4.8 5.7-4.8s4.9 1.6 5.7 4.8M15.3 9.3a2.6 2.6 0 1 0 0-5.2M17.6 14.6c2 .5 3.3 1.9 3.8 4.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>); }

function ChatIcon() { return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 5.5h16v10H9l-4 3.5v-3.5H4v-10Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></svg>); }

function CalendarIcon() { return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="4" y="5.5" width="16" height="14.5" rx="2" stroke="var(--primary)" strokeWidth="1.7" /><path d="M4 10h16M8 3.5v3M16 3.5v3" stroke="var(--primary)" strokeWidth="1.7" strokeLinecap="round" /></svg>); }

function PdfIcon() { return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M7 3.5h7l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" fill="#FEE2E2" stroke="#DC2626" strokeWidth="1.3" strokeLinejoin="round" /></svg>); }


export default Dashboard;
