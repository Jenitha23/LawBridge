import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getSavedChats, setChatSaved } from "../../services/chatService";
import { useLanguage } from "../../context/LanguageContext";
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

    const { t } = useLanguage();

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
                    t("saved_answers_could_not_load")
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
                t("saved_answers_could_not_remove")
            );
        }
        finally
        {
            setRemovingId(null);
        }

    };


    return (

        <DashboardLayout title={t("nav_saved_answers")}>

            {() => (

                <section className="chat-history-panel">

                    <div className="chat-history-header">
                        <h3>{t("nav_saved_answers")}</h3>
                        <button onClick={() => navigate("/dashboard?new=1")}>+ {t("nav_new_chat")}</button>
                    </div>


                    {error && <div className="chat-error" style={{ margin: "0 0 16px" }}>{error}</div>}


                    {loading ? (

                        <p className="chat-muted">{t("common_loading")}</p>

                    ) : saved.length === 0 ? (

                        <div className="chat-history-empty">
                            <p>{t("saved_answers_empty")}</p>
                            <button onClick={() => navigate("/dashboard?new=1")}>{t("saved_answers_ask")}</button>
                        </div>

                    ) : (

                        <div className="chat-history-list">

                            {saved.map((s) => (

                                <div
                                    key={s.id}
                                    className="chat-history-item"
                                    onClick={() => navigate(`/dashboard?id=${s.conversationId}`)}
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
                                            title={t("saved_answers_remove_title")}
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