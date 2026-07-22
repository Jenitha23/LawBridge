import { useEffect, useState } from "react";
import AdminDashboardLayout from "../../layouts/AdminDashboardLayout";
import { getChatLogs, getChatLogDetail } from "../../services/adminChatLogService";
import "./UploadDocument.css";
import "./ChatLogs.css";


function formatDate(dateString)
{
    const d = new Date(dateString);

    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) +
        " · " +
        d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}


function ChatLogs()
{

    const [logs, setLogs] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");


    const [viewingLog, setViewingLog] = useState(null);

    const [viewLoading, setViewLoading] = useState(false);

    const [viewError, setViewError] = useState("");


    const loadLogs = async (search) =>
    {
        try
        {
            const data = await getChatLogs({ search });

            setLogs(data);

            setError("");
        }
        catch (err)
        {
            setError(
                err.response?.data?.message ||
                "Could not load chat logs."
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
        loadLogs();

    }, []);


    const handleSearchSubmit = (e) =>
    {
        e.preventDefault();

        setLoading(true);

        loadLogs(search);
    };


    const openLog = async (id) =>
    {
        setViewLoading(true);

        setViewError("");

        setViewingLog(null);

        try
        {
            const detail = await getChatLogDetail(id);

            setViewingLog(detail);
        }
        catch (err)
        {
            setViewError(
                err.response?.data?.message ||
                "Could not load this chat log."
            );
        }
        finally
        {
            setViewLoading(false);
        }
    };


    return (

        <AdminDashboardLayout title="AI Chat Logs">

            {() => (

                <>

                    <section className="admin-panel">

                        <div className="admin-panel-header upload-list-header">

                            <h3>All Conversations</h3>

                            <form className="upload-search" onSubmit={handleSearchSubmit}>
                                <SearchIcon />
                                <input
                                    type="text"
                                    placeholder="Search by question, name, or email..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </form>

                        </div>


                        {error && <div className="upload-page-error">{error}</div>}


                        {loading ? (

                            <p className="admin-panel-muted">Loading chat logs…</p>

                        ) : logs.length === 0 ? (

                            <p className="admin-panel-muted">No AI chat activity yet.</p>

                        ) : (

                            <div className="upload-table-wrap">

                                <table className="upload-table">

                                    <thead>
                                        <tr>
                                            <th>User</th>
                                            <th>Question</th>
                                            <th>Category</th>
                                            <th>Language</th>
                                            <th>Asked On</th>
                                        </tr>
                                    </thead>

                                    <tbody>

                                        {logs.map((log) => (

                                            <tr key={log.id} className="chat-log-row" onClick={() => openLog(log.id)}>

                                                <td>
                                                    <div className="upload-doc-title">{log.userName}</div>
                                                    <div className="upload-doc-file">{log.userEmail}</div>
                                                </td>

                                                <td className="chat-log-question">{log.question}</td>

                                                <td>{log.category && <span className="tag tag-purple">{log.category}</span>}</td>

                                                <td>{log.language}</td>

                                                <td>{formatDate(log.createdAt)}</td>

                                            </tr>

                                        ))}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </section>


                    {(viewLoading || viewingLog || viewError) && (

                        <div className="upload-modal-overlay" onClick={() => { setViewingLog(null); setViewError(""); }}>

                            <div className="upload-modal" onClick={(e) => e.stopPropagation()}>

                                <div className="upload-modal-header">
                                    <h3>Conversation Detail</h3>
                                    <button className="upload-modal-close" onClick={() => { setViewingLog(null); setViewError(""); }}>×</button>
                                </div>

                                {viewLoading && <p className="admin-panel-muted">Loading…</p>}

                                {viewError && <div className="upload-page-error">{viewError}</div>}

                                {viewingLog && (

                                    <>

                                        <dl className="upload-modal-facts">

                                            <div>
                                                <dt>User</dt>
                                                <dd>{viewingLog.userName}</dd>
                                            </div>

                                            <div>
                                                <dt>Email</dt>
                                                <dd>{viewingLog.userEmail}</dd>
                                            </div>

                                            <div>
                                                <dt>Category</dt>
                                                <dd>{viewingLog.category || "—"}</dd>
                                            </div>

                                            <div>
                                                <dt>Asked</dt>
                                                <dd>{formatDate(viewingLog.createdAt)}</dd>
                                            </div>

                                        </dl>


                                        <h4 className="chat-log-section-title">Question</h4>
                                        <p className="doc-explanation">{viewingLog.question}</p>

                                        <h4 className="chat-log-section-title">Explanation</h4>
                                        <p className="doc-explanation">{viewingLog.explanation}</p>

                                        {viewingLog.relevantLegalInfo && (
                                            <>
                                                <h4 className="chat-log-section-title">Relevant Legal Information</h4>
                                                <p className="doc-explanation">{viewingLog.relevantLegalInfo}</p>
                                            </>
                                        )}

                                        {viewingLog.possibleActions?.length > 0 && (
                                            <>
                                                <h4 className="chat-log-section-title">Possible Actions</h4>
                                                <ul className="chat-log-list">
                                                    {viewingLog.possibleActions.map((a, i) => <li key={i}>{a}</li>)}
                                                </ul>
                                            </>
                                        )}

                                        {viewingLog.sources?.length > 0 && (
                                            <p className="chat-log-sources">Sources: {viewingLog.sources.join(", ")}</p>
                                        )}

                                    </>

                                )}

                            </div>

                        </div>

                    )}

                </>

            )}

        </AdminDashboardLayout>

    );

}


function SearchIcon() { return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.7" /><path d="M20 20l-4.5-4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>); }


export default ChatLogs;
