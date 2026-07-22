import { useEffect, useState } from "react";
import AdminDashboardLayout from "../../layouts/AdminDashboardLayout";
import { getDashboardStats } from "../../services/adminService";
import "./Dashboard.css";
import "./Analytics.css";


function RankedBarList({ items, maxValue, labelKey, valueKey, emptyText })
{

    if (!items || items.length === 0)
    {
        return <p className="admin-panel-muted">{emptyText}</p>;
    }

    const max = maxValue || Math.max(...items.map((i) => i[valueKey]), 1);

    return (

        <div className="analytics-bar-list">

            {items.map((item, i) => (

                <div className="analytics-bar-row" key={i}>

                    <div className="analytics-bar-label">
                        <span>{item[labelKey]}</span>
                        <span className="analytics-bar-value">{item[valueKey]}</span>
                    </div>

                    <div className="analytics-bar-track">
                        <div
                            className="analytics-bar-fill"
                            style={{ width: `${Math.max(4, (item[valueKey] / max) * 100)}%` }}
                        />
                    </div>

                </div>

            ))}

        </div>

    );

}


function Analytics()
{

    const [stats, setStats] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    useEffect(() =>
    {

        getDashboardStats()
            .then(setStats)
            .catch((err) =>
            {
                setError(
                    err.response?.data?.message ||
                    "Could not load analytics."
                );
            })
            .finally(() => setLoading(false));

    }, []);


    return (

        <AdminDashboardLayout title="Analytics">

            {() => (

                <>

                    {error && <div className="upload-page-error">{error}</div>}

                    {loading ? (

                        <p className="admin-panel-muted">Loading analytics…</p>

                    ) : stats && (

                        <>

                            <section className="analytics-stats-grid">

                                <div className="admin-stat-card">
                                    <div className="admin-stat-value">{stats.totalUsers.toLocaleString()}</div>
                                    <div className="admin-stat-label">Total Users</div>
                                </div>

                                <div className="admin-stat-card">
                                    <div className="admin-stat-value">{stats.totalDocuments.toLocaleString()}</div>
                                    <div className="admin-stat-label">Uploaded Legal Documents</div>
                                </div>

                                <div className="admin-stat-card">
                                    <div className="admin-stat-value">{stats.totalChatSessions.toLocaleString()}</div>
                                    <div className="admin-stat-label">AI Questions Asked</div>
                                </div>

                                <div className="admin-stat-card">
                                    <div className="admin-stat-value">{stats.totalCategories.toLocaleString()}</div>
                                    <div className="admin-stat-label">Legal Categories</div>
                                </div>

                            </section>


                            <section className="analytics-grid">

                                <div className="admin-panel">

                                    <div className="admin-panel-header">
                                        <h3>Popular Legal Categories</h3>
                                    </div>

                                    <RankedBarList
                                        items={stats.popularTopics}
                                        labelKey="category"
                                        valueKey="count"
                                        emptyText="No questions have been asked yet."
                                    />

                                </div>


                                <div className="admin-panel">

                                    <div className="admin-panel-header">
                                        <h3>Top Viewed Documents</h3>
                                    </div>

                                    <RankedBarList
                                        items={stats.topViewedDocuments}
                                        labelKey="title"
                                        valueKey="viewCount"
                                        emptyText="No documents have been viewed by users yet."
                                    />

                                </div>


                                <div className="admin-panel">

                                    <div className="admin-panel-header">
                                        <h3>Documents by Category</h3>
                                    </div>

                                    <RankedBarList
                                        items={stats.categoryBreakdown}
                                        labelKey="name"
                                        valueKey="count"
                                        emptyText="No documents uploaded yet."
                                    />

                                </div>


                                <div className="admin-panel">

                                    <div className="admin-panel-header">
                                        <h3>User Registrations (Last 12 Days)</h3>
                                    </div>

                                    {stats.registrationTrend.length > 0 ? (

                                        <div className="analytics-mini-bars">

                                            {stats.registrationTrend.map((p) => {

                                                const max = Math.max(...stats.registrationTrend.map((x) => x.count), 1);

                                                return (

                                                    <div className="analytics-mini-bar-col" key={p.date}>
                                                        <div
                                                            className="analytics-mini-bar"
                                                            style={{ height: `${Math.max(4, (p.count / max) * 100)}%` }}
                                                            title={`${p.count} on ${new Date(p.date).toLocaleDateString()}`}
                                                        />
                                                        <span>{new Date(p.date).toLocaleDateString("en-US", { day: "numeric" })}</span>
                                                    </div>

                                                );

                                            })}

                                        </div>

                                    ) : (

                                        <p className="admin-panel-muted">No registrations in this period.</p>

                                    )}

                                </div>


                                <div className="admin-panel analytics-activity-panel">

                                    <div className="admin-panel-header">
                                        <h3>System Activity</h3>
                                        <span className="admin-panel-muted">Recent uploads</span>
                                    </div>

                                    {stats.recentDocuments.length > 0 ? (

                                        <ul className="doc-list">

                                            {stats.recentDocuments.map((doc) => (

                                                <li key={doc.title + doc.createdAt}>
                                                    <div className="doc-list-name">{doc.title}</div>
                                                    <span className="tag tag-purple">{doc.categoryName}</span>
                                                    <span className="doc-list-time">{new Date(doc.createdAt).toLocaleDateString()}</span>
                                                </li>

                                            ))}

                                        </ul>

                                    ) : (

                                        <p className="admin-panel-muted">No recent activity.</p>

                                    )}

                                </div>

                            </section>

                        </>

                    )}

                </>

            )}

        </AdminDashboardLayout>

    );

}


export default Analytics;
