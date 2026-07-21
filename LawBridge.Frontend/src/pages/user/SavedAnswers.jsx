import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getSavedChats, setChatSaved } from "../../services/chatService";
import "./ChatHistory.css";


function formatDate(dateString)
{
    const d = new Date(dateString);

    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) +
        " · " +
        d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}


function SavedAnswers()
{

    const navigate = useNavigate();

    const [saved, setSaved] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [removingId, setRemovingId] = useState(null);


    useEffect(() =>
    {

        getSavedChats()
            .then(setSaved)
            .catch((err) =>
            {
                setError(
                    err.response?.data?.message ||
                    "Could not load your saved answers."
                );
            })
            .finally(() => setLoading(false));

    }, []);


    const handleUnsave = async (e, id) =>
    {

        e.stopPropagation();

        setRemovingId(id);

        try
        {
            await setChatSaved(id, false);

            setSaved((prev) => prev.filter((s) => s.id !== id));
        }
        catch (err)
        {
            setError(
                err.response?.data?.message ||
                "Could not remove this answer."
            );
        }
        finally
        {
            setRemovingId(null);
        }

    };


    return (

        <DashboardLayout title="Saved Answers">

            {() => (

                <section className="chat-history-panel">

                    <div className="chat-history-header">
                        <h3>Saved Answers</h3>
                        <button onClick={() => navigate("/dashboard?new=1")}>+ New Chat</button>
                    </div>


                    {error && <div className="chat-error" style={{ margin: "0 0 16px" }}>{error}</div>}


                    {loading ? (

                        <p className="chat-muted">Loading…</p>

                    ) : saved.length === 0 ? (

                        <div className="chat-history-empty">
                            <p>You haven't saved any answers yet. Tap ☆ Save on an answer in chat to keep it here.</p>
                            <button onClick={() => navigate("/dashboard?new=1")}>Ask a question</button>
                        </div>

                    ) : (

                        <div className="chat-history-list">

                            {saved.map((s) => (

                                <div
                                    key={s.id}
                                    className="chat-history-item"
                                    onClick={() => navigate(`/dashboard?id=${s.id}`)}
                                >

                                    <div>
                                        <p className="chat-history-question">
                                            <span className="chat-history-star">★</span>
                                            {s.question}
                                        </p>
                                        <span className="chat-history-meta">{formatDate(s.createdAt)} · {s.language}</span>
                                    </div>

                                    <div className="chat-history-item-right">

                                        {s.category && <span className="tag tag-purple">{s.category}</span>}

                                        <button
                                            className="chat-history-delete"
                                            onClick={(e) => handleUnsave(e, s.id)}
                                            disabled={removingId === s.id}
                                            title="Remove from saved"
                                        >
                                            ✕
                                        </button>

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </section>

            )}

        </DashboardLayout>

    );

}


export default SavedAnswers;
