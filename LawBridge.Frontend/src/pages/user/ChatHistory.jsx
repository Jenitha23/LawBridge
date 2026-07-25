import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getChatHistory, deleteChat } from "../../services/chatService";
import { useLanguage } from "../../context/LanguageContext";
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

    const { t } = useLanguage();

    const [history, setHistory] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [deletingId, setDeletingId] = useState(null);


    useEffect(() =>
    {

        getChatHistory()
            .then(setHistory)
            .catch((err) =>
            {
                setError(
                    err.response?.data?.message ||
                    t("chat_history_could_not_load")
                );
            })
            .finally(() => setLoading(false));

    }, []);


    const handleDelete = async (e, id) =>
    {

        e.stopPropagation();

        if (!window.confirm(t("chat_history_delete_confirm"))) return;

        setDeletingId(id);

        try
        {
            await deleteChat(id);

            setHistory((prev) => prev.filter((h) => h.id !== id));
        }
        catch (err)
        {
            setError(
                err.response?.data?.message ||
                t("chat_history_could_not_delete")
            );
        }
        finally
        {
            setDeletingId(null);
        }

    };


    return (

        <DashboardLayout title={t("nav_my_chats")}>

            {() => (

                <section className="chat-history-panel">

                    <div className="chat-history-header">
                        <h3>{t("chat_history_past_questions")}</h3>
                        <button onClick={() => navigate("/dashboard?new=1")}>+ {t("nav_new_chat")}</button>
                    </div>


                    {error && <div className="chat-error" style={{ margin: "0 0 16px" }}>{error}</div>}


                    {loading ? (

                        <p className="chat-muted">{t("common_loading")}</p>

                    ) : history.length === 0 ? (

                        <div className="chat-history-empty">
                            <p>{t("chat_history_empty")}</p>
                            <button onClick={() => navigate("/dashboard?new=1")}>{t("chat_history_ask_first")}</button>
                        </div>

                    ) : (

                        <div className="chat-history-list">

                            {history.map((h) => (

                                <div
                                    key={h.id}
                                    className="chat-history-item"
                                    onClick={() => navigate(`/dashboard?id=${h.id}`)}
                                >

                                    <div>
                                        <p className="chat-history-question">
                                            {h.isSaved && <span className="chat-history-star">★</span>}
                                            {h.question}
                                        </p>
                                        <span className="chat-history-meta">{formatDate(h.createdAt)} · {h.language}</span>
                                    </div>

                                    <div className="chat-history-item-right">

                                        {h.category && <span className="tag tag-purple">{h.category}</span>}

                                        <button
                                            className="chat-history-delete"
                                            onClick={(e) => handleDelete(e, h.id)}
                                            disabled={deletingId === h.id}
                                            title={t("chat_history_delete_title")}
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


export default ChatHistory;
