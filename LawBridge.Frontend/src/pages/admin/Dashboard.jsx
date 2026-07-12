import AdminDashboardLayout from "../../layouts/AdminDashboardLayout";
import "./Dashboard.css";


// ============================================================
// SAMPLE DATA
// The backend currently has no endpoints for document counts,
// storage usage, chat-session analytics, or registration trends
// (no such tables/controllers exist yet - see AppDbContext.cs).
// These numbers are placeholders so the dashboard matches the
// design; swap them for real API calls once those endpoints exist.
// ============================================================

const STATS = [

    { label: "Total Documents", value: "156", sub: "All legal documents", color: "purple", icon: <DocIcon /> },
    { label: "Storage Used", value: "24.5 MB", sub: "Total system storage", color: "green", icon: <StorageIcon /> },
    { label: "Total Users", value: "1,248", sub: "Registered users", color: "blue", icon: <UsersIcon /> },
    { label: "AI Chat Sessions", value: "892", sub: "This month", color: "violet", icon: <ChatIcon /> }

];


const CATEGORIES = [

    { name: "Labour Laws", count: 62, percent: 40, color: "#4F32C4" },
    { name: "Tenancy Laws", count: 47, percent: 30, color: "#16A34A" },
    { name: "Consumer Protection Laws", count: 31, percent: 20, color: "#F59E0B" },
    { name: "Other Laws", count: 16, percent: 10, color: "#7C5CFA" }

];


const RECENT_DOCUMENTS = [

    { title: "Employment_Act_No_24.pdf", tag: "Labour Laws", time: "2 hours ago" },
    { title: "Tenancy_Act_No_17.pdf", tag: "Tenancy Laws", time: "5 hours ago" },
    { title: "Consumer_Protection_Act.pdf", tag: "Consumer Protection", time: "1 day ago" },
    { title: "Shop_and_Office_Employees_Act.pdf", tag: "Labour Laws", time: "2 days ago" },
    { title: "Industrial_Disputes_Act.pdf", tag: "Labour Laws", time: "3 days ago" }

];


const TOP_VIEWED = [

    { title: "Employment_Act_No_24.pdf", views: 245 },
    { title: "Tenancy_Act_No_17.pdf", views: 189 },
    { title: "Consumer_Protection_Act.pdf", views: 156 },
    { title: "Shop_and_Office_Employees_Act.pdf", views: 134 },
    { title: "Industrial_Disputes_Act.pdf", views: 98 }

];


// Last 7 calendar days, labelled dynamically off the real current date.
function getLastDays(n)
{
    const days = [];

    const today = new Date();

    for (let i = n - 1; i >= 0; i--)
    {
        const d = new Date(today);

        d.setDate(today.getDate() - i);

        days.push(d);
    }

    return days;
}


const CHAT_SESSION_VALUES = [55, 90, 70, 110, 80, 95, 120];

const REGISTRATION_VALUES = [12, 18, 22, 28, 45, 38, 42, 40, 55, 48, 60, 65];


function tagClass(tag)
{
    if (tag === "Labour Laws") return "tag tag-purple";

    if (tag === "Tenancy Laws") return "tag tag-green";

    return "tag tag-orange";
}


function Dashboard()
{

    const days7 = getLastDays(7);

    const days12 = getLastDays(12);

    const today = new Date();

    const dateLabel = today.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

    const weekdayLabel = today.toLocaleDateString("en-US", { weekday: "long" });


    return (

        <AdminDashboardLayout title="Admin Dashboard">

            {({ user }) => (

                <>

                    <div className="sample-data-banner">

                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
                            <path d="M12 8v5M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>

                        <span>
                            The charts and counters below are sample data. Your backend doesn't have
                            document, storage, or chat-analytics endpoints yet — the profile card above
                            and Sign In are the only parts of this screen backed by live data.
                        </span>

                    </div>


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

                        {STATS.map((stat) => (

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
                                <span className="admin-panel-pill">This Month</span>
                            </div>

                            <div className="donut-row">

                                <DonutChart segments={CATEGORIES} />

                                <ul className="donut-legend">

                                    {CATEGORIES.map((c) => (

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

                        </div>


                        <div className="admin-panel">

                            <div className="admin-panel-header">
                                <h3>Recent Documents</h3>
                                <a href="#recent" onClick={(e) => e.preventDefault()}>View All</a>
                            </div>

                            <ul className="doc-list">

                                {RECENT_DOCUMENTS.map((doc) => (

                                    <li key={doc.title}>

                                        <div className="doc-list-icon"><PdfIcon /></div>

                                        <div className="doc-list-name">{doc.title}</div>

                                        <span className={tagClass(doc.tag)}>{doc.tag}</span>

                                        <span className="doc-list-time">{doc.time}</span>

                                    </li>

                                ))}

                            </ul>

                        </div>

                    </section>


                    <section className="admin-bottom-grid">

                        <div className="admin-panel">

                            <div className="admin-panel-header">
                                <h3>AI Chat Sessions</h3>
                                <span className="admin-panel-muted">This Month</span>
                            </div>

                            <AreaChart
                                values={CHAT_SESSION_VALUES}
                                labels={days7.map((d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" }))}
                            />

                        </div>


                        <div className="admin-panel">

                            <div className="admin-panel-header">
                                <h3>Top Viewed Documents</h3>
                                <a href="#top" onClick={(e) => e.preventDefault()}>View All</a>
                            </div>

                            <ul className="rank-list">

                                {TOP_VIEWED.map((doc, i) => (

                                    <li key={doc.title}>
                                        <span className="rank-badge">{i + 1}</span>
                                        <span className="rank-name">{doc.title}</span>
                                        <span className="rank-views">{doc.views} views</span>
                                    </li>

                                ))}

                            </ul>

                        </div>


                        <div className="admin-panel">

                            <div className="admin-panel-header">
                                <h3>User Registrations</h3>
                                <span className="admin-panel-muted">This Month</span>
                            </div>

                            <BarChart
                                values={REGISTRATION_VALUES}
                                labels={days12.map((d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" }))}
                            />

                        </div>

                    </section>

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

    // Precompute each segment's starting offset (as a length along the
    // circumference) without mutating anything during render.
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


function AreaChart({ values, labels })
{

    const width = 480;

    const height = 180;

    const padding = 24;

    const max = Math.max(...values) * 1.15;

    const stepX = (width - padding * 2) / (values.length - 1);


    const points = values.map((v, i) => {

        const x = padding + i * stepX;

        const y = height - padding - (v / max) * (height - padding * 2);

        return [x, y];

    });


    const linePath = points.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(" ");

    const areaPath = `${linePath} L ${points[points.length - 1][0]} ${height - padding} L ${points[0][0]} ${height - padding} Z`;

    const last = points[points.length - 1];


    return (

        <svg width="100%" viewBox={`0 0 ${width} ${height + 34}`} className="area-chart">

            <defs>
                <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                </linearGradient>
            </defs>

            <path d={areaPath} fill="url(#areaFill)" />

            <path d={linePath} fill="none" stroke="var(--primary)" strokeWidth="2.5" />

            {points.map((p, i) => (
                <circle key={i} cx={p[0]} cy={p[1]} r={i === points.length - 1 ? 4.5 : 0} fill="var(--primary)" />
            ))}

            <g transform={`translate(${last[0] - 46}, ${last[1] - 42})`}>
                <rect width="92" height="34" rx="8" fill="var(--text-heading)" />
                <text x="46" y="14" textAnchor="middle" fill="#fff" fontSize="10.5" fontWeight="700">{labels[labels.length - 1]}</text>
                <text x="46" y="26" textAnchor="middle" fill="#D8D2F5" fontSize="10">{values[values.length - 1]} sessions</text>
            </g>

            {labels.map((l, i) => (
                <text
                    key={l}
                    x={padding + i * stepX}
                    y={height + 22}
                    textAnchor="middle"
                    className="chart-axis-label"
                >
                    {l}
                </text>
            ))}

        </svg>

    );

}


function BarChart({ values, labels })
{

    const width = 480;

    const height = 180;

    const padding = 24;

    const max = Math.max(...values) * 1.15;

    const barGap = 6;

    const barWidth = (width - padding * 2) / values.length - barGap;


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
