import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getChatHistory } from "../../services/chatService";
import "./ChatHistory.css";


function formatDate(dateString)
{
    const d = new Date(dateString);

    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) +
        " · " +
        d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}


function ChatHistory()
{

    const navigate = useNavigate();

    const [history, setHistory] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    useEffect(() =>
    {

        getChatHistory()
            .then(setHistory)
            .catch((err) =>
            {
                setError(
                    err.response?.data?.message ||
                    "Could not load your chat history."
                );
            })
            .finally(() => setLoading(false));

    }, []);


    return (

        <DashboardLayout title="My Chats">

            {() => (

                <section className="chat-history-panel">

                    <div className="chat-history-header">
                        <h3>Past Questions</h3>
                        <button onClick={() => navigate("/dashboard?new=1")}>+ New Chat</button>
                    </div>


                    {error && <div className="chat-error" style={{ margin: "0 0 16px" }}>{error}</div>}


                    {loading ? (

                        <p className="chat-muted">Loading…</p>

                    ) : history.length === 0 ? (

                        <div className="chat-history-empty">
                            <p>You haven't asked any questions yet.</p>
                            <button onClick={() => navigate("/dashboard?new=1")}>Ask your first question</button>
                        </div>

                    ) : (

                        <div className="chat-history-list">

                            {history.map((h) => (

                                <button
                                    key={h.id}
                                    className="chat-history-item"
                                    onClick={() => navigate(`/dashboard?id=${h.id}`)}
                                >

                                    <div>
                                        <p className="chat-history-question">{h.question}</p>
                                        <span className="chat-history-meta">{formatDate(h.createdAt)} · {h.language}</span>
                                    </div>

                                    {h.category && <span className="tag tag-purple">{h.category}</span>}

                                </button>

                            ))}

                        </div>

                    )}

                </section>

            )}

        </DashboardLayout>

    );

}


export default ChatHistory;
