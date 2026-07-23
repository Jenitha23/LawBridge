import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { askQuestion, getChatDetail, getChatHistory, setChatSaved } from "../../services/chatService";
import { useLanguage } from "../../context/LanguageContext";
import chatLogo from "../../assets/logo.png";
import "./ChatPanel.css";


const LANGUAGES = ["English", "Sinhala", "Tamil"];

// How many previous Q&A pairs from this session get sent back to the
// API as context so the assistant can handle natural follow-up questions.
const HISTORY_WINDOW = 3;


function formatClockTime(date)
{
    if (!date) return "";

    const d = date instanceof Date ? date : new Date(date);

    if (Number.isNaN(d.getTime())) return "";

    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}


function formatRelativeTime(dateString, t)
{
    if (!dateString) return "";

    const then = new Date(dateString).getTime();

    if (Number.isNaN(then)) return "";

    const diffMs = Date.now() - then;

    const minutes = Math.floor(diffMs / 60000);

    if (minutes < 1) return t("time_just_now");
    if (minutes < 60) return `${minutes} ${minutes === 1 ? t("time_min") : t("time_mins")} ${t("time_ago")}`;

    const hours = Math.floor(minutes / 60);

    if (hours < 24) return `${hours} ${hours === 1 ? t("time_hour") : t("time_hours")} ${t("time_ago")}`;

    const days = Math.floor(hours / 24);

    if (days < 7) return `${days} ${days === 1 ? t("time_day") : t("time_days")} ${t("time_ago")}`;

    return new Date(dateString).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}


function AnswerCard({ answer, onToggleSave, t })
{

    const [saving, setSaving] = useState(false);


    const handleToggleSave = async () =>
    {

        if (!answer.id || saving) return;

        setSaving(true);

        try
        {
            await onToggleSave(answer.id, !answer.isSaved);
        }
        finally
        {
            setSaving(false);
        }

    };


    if (answer.needsClarification)
    {

        return (

            <div className="chat-answer-card chat-clarify-card">

                <span className="chat-clarify-label">{t("chat_clarify_label")}</span>

                <p className="chat-clarify-question">{answer.clarifyingQuestion}</p>

            </div>

        );

    }


    return (

        <div className="chat-answer-card">

            <div className="chat-answer-top">

                {answer.category && (
                    <span className="chat-category-pill">{answer.category}</span>
                )}

                {answer.id && (

                    <button
                        className={`chat-save-btn ${answer.isSaved ? "saved" : ""}`}
                        onClick={handleToggleSave}
                        disabled={saving}
                        title={answer.isSaved ? t("saved_answers_remove_title") : t("chat_save_tooltip")}
                    >
                        {answer.isSaved ? `★ ${t("answer_saved")}` : `☆ ${t("answer_save")}`}
                    </button>

                )}

            </div>

            {answer.translationNote && (
                <div className="chat-translation-note">{answer.translationNote}</div>
            )}

            <h4>{t("answer_explanation")}</h4>
            <p>{answer.explanation}</p>

            {answer.relevantLegalInfo && (

                <>
                    <h4>{t("answer_relevant_legal_info")}</h4>
                    <p>{answer.relevantLegalInfo}</p>
                </>

            )}

            {answer.possibleActions?.length > 0 && (

                <>
                    <h4>{t("answer_possible_actions")}</h4>
                    <ul>
                        {answer.possibleActions.map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                </>

            )}

            {answer.requiredDocuments?.length > 0 && (

                <>
                    <h4>{t("answer_required_documents")}</h4>
                    <ul>
                        {answer.requiredDocuments.map((d, i) => <li key={i}>{d}</li>)}
                    </ul>
                </>

            )}

            {answer.whenToConsultLawyer && (

                <div className="chat-lawyer-note">
                    <strong>{t("answer_consult_lawyer")}</strong> {answer.whenToConsultLawyer}
                </div>

            )}

            {answer.sources?.length > 0 && (

                <div className="chat-sources">
                    {t("answer_sources")} {answer.sources.join(", ")}
                </div>

            )}

        </div>

    );

}


function ChatPanel({ historyId, user })
{

    const navigate = useNavigate();

    const { t } = useLanguage();

    const [messages, setMessages] = useState([]);

    const [question, setQuestion] = useState("");

    const [answerLanguage, setAnswerLanguage] = useState("English");

    const [asking, setAsking] = useState(false);

    const [error, setError] = useState("");

    const [loadingHistory, setLoadingHistory] = useState(!!historyId);

    const [recentChats, setRecentChats] = useState([]);

    const [loadingRecent, setLoadingRecent] = useState(true);

    const bottomRef = useRef(null);

    const firstName = user?.name?.split(" ")[0] || "there";


    useEffect(() =>
    {

        if (!historyId)
        {
            setMessages([]);

            setLoadingHistory(false);

            return;
        }


        let cancelled = false;

        setLoadingHistory(true);

        setError("");


        getChatDetail(historyId)
            .then((detail) =>
            {
                if (cancelled) return;

                setMessages([{ question: detail.question, answer: detail, askedAt: detail.createdAt }]);

                setAnswerLanguage(detail.language || "English");
            })
            .catch((err) =>
            {
                if (cancelled) return;

                setError(
                    err.response?.data?.message ||
                    t("chat_could_not_load")
                );
            })
            .finally(() =>
            {
                if (!cancelled) setLoadingHistory(false);
            });


        return () => { cancelled = true; };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [historyId]);


    useEffect(() =>
    {

        let cancelled = false;

        setLoadingRecent(true);

        getChatHistory()
            .then((data) =>
            {
                if (cancelled) return;

                setRecentChats((data || []).slice(0, 3));
            })
            .catch(() =>
            {
                /* Recent chats panel is a UI convenience only — fail silently */
            })
            .finally(() =>
            {
                if (!cancelled) setLoadingRecent(false);
            });

        return () => { cancelled = true; };

    }, [historyId, messages.length]);


    useEffect(() =>
    {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });

    }, [messages, asking]);


    const handleAsk = async (text) =>
    {

        const q = (text ?? question).trim();

        if (!q || asking) return;


        setQuestion("");

        setError("");

        setAsking(true);

        setMessages((prev) => [...prev, { question: q, answer: null, askedAt: new Date().toISOString() }]);


        try
        {
            // Send a short window of prior answered turns so the assistant
            // can follow up naturally instead of treating every message
            // as a brand-new, unrelated question.
            const conversationHistory = messages
                .filter((m) => m.answer && !m.answer.needsClarification)
                .slice(-HISTORY_WINDOW)
                .map((m) => ({ question: m.question, explanation: m.answer.explanation }));

            const answer = await askQuestion(q, answerLanguage, conversationHistory);

            setMessages((prev) =>
            {
                const next = [...prev];

                next[next.length - 1] = { question: q, answer, askedAt: answer?.createdAt || next[next.length - 1].askedAt };

                return next;
            });
        }
        catch (err)
        {
            setError(
                err.response?.data?.message ||
                t("chat_error_generic")
            );

            setMessages((prev) => prev.slice(0, -1));
        }
        finally
        {
            setAsking(false);
        }

    };


    const handleToggleSave = async (id, isSaved) =>
    {

        try
        {
            await setChatSaved(id, isSaved);

            setMessages((prev) => prev.map((m) =>
                m.answer?.id === id
                    ? { ...m, answer: { ...m.answer, isSaved } }
                    : m
            ));
        }
        catch (err)
        {
            setError(
                err.response?.data?.message ||
                t("chat_could_not_update_saved")
            );
        }

    };


    const handleSubmit = (e) =>
    {
        e.preventDefault();

        handleAsk();
    };


    const exampleQuestions = [
        t("chat_example_1"),
        t("chat_example_2"),
        t("chat_example_3")
    ];


    return (

        <div className="chat-layout">

            <aside className="recent-chats-panel">

                <div className="recent-chats-header">
                    <h3>{t("chat_recent_chats")}</h3>
                    <button onClick={() => navigate("/dashboard?new=1")}>+ {t("nav_new_chat")}</button>
                </div>

                <div className="recent-chats-list">

                    {loadingRecent && <p className="chat-muted recent-chats-loading">{t("common_loading")}</p>}

                    {!loadingRecent && recentChats.length === 0 && (
                        <p className="chat-muted recent-chats-loading">{t("chat_no_conversations")}</p>
                    )}

                    {!loadingRecent && recentChats.map((h) => (

                        <button
                            key={h.id}
                            className={`recent-chat-item ${String(historyId) === String(h.id) ? "active" : ""}`}
                            onClick={() => navigate(`/dashboard?id=${h.id}`)}
                        >

                            <span className="recent-chat-icon">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M4 5.5h16v10H9l-4 3.5v-3.5H4v-10Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                                </svg>
                            </span>

                            <span className="recent-chat-text">
                                <span className="recent-chat-title">{h.question}</span>
                                <span className="recent-chat-time">{formatRelativeTime(h.createdAt, t)}</span>
                            </span>

                        </button>

                    ))}

                </div>

                <button className="view-all-chats-link" onClick={() => navigate("/chats")}>
                    {t("chat_view_all")} <span aria-hidden="true">→</span>
                </button>

            </aside>


            <section className="chat-panel">

                <div className="chat-panel-header">

                    <div className="chat-panel-title">
                        <h2>{t("chat_with")} <span className="accent">LawBridge AI</span></h2>
                        <p>{t("chat_subtitle")}</p>
                    </div>

                    <select
                        className="chat-language-select"
                        value={answerLanguage}
                        onChange={(e) => setAnswerLanguage(e.target.value)}
                    >
                        {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>

                </div>


                <div className="chat-thread">

                    {loadingHistory && <p className="chat-muted">{t("common_loading")}</p>}

                    {!loadingHistory && messages.length === 0 && (

                        <div className="chat-empty-state">

                            <div className="chat-msg chat-msg-ai">

                                <img src={chatLogo} alt="" className="chat-avatar" />

                                <div className="chat-msg-body">

                                    <div className="chat-bubble chat-bubble-ai">
                                        <p>Hello, {firstName}! 👋</p>
                                        <p>{t("chat_greeting_intro")}</p>
                                        <p>{t("chat_greeting_body")}</p>
                                    </div>

                                    <span className="chat-timestamp">{formatClockTime(new Date())}</span>

                                </div>

                            </div>

                            <div className="chat-examples">

                                {exampleQuestions.map((ex) => (
                                    <button key={ex} onClick={() => handleAsk(ex)}>{ex}</button>
                                ))}

                            </div>

                        </div>

                    )}

                    {messages.map((m, i) => (

                        <div className="chat-exchange" key={i}>

                            <div className="chat-msg chat-msg-user">

                                <div className="chat-msg-body">

                                    <div className="chat-bubble chat-bubble-user">{m.question}</div>

                                    <span className="chat-timestamp chat-timestamp-user">
                                        {formatClockTime(m.askedAt)}
                                        <svg width="14" height="10" viewBox="0 0 16 11" fill="none" className="chat-read-tick">
                                            <path d="M1 5.5 4.5 9 11 1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M5.2 5.5 8.7 9 15.2 1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>

                                </div>

                            </div>

                            <div className="chat-msg chat-msg-ai">

                                <img src={chatLogo} alt="" className="chat-avatar" />

                                {m.answer ? (

                                    <div className="chat-msg-body">

                                        <AnswerCard answer={m.answer} onToggleSave={handleToggleSave} t={t} />

                                        <span className="chat-timestamp">{formatClockTime(m.askedAt)}</span>

                                    </div>

                                ) : (

                                    <div className="chat-msg-body">

                                        <div className="chat-bubble chat-bubble-ai chat-thinking">
                                            <span className="chat-thinking-label">{t("chat_typing")}</span>
                                            <span className="chat-dot" />
                                            <span className="chat-dot" />
                                            <span className="chat-dot" />
                                        </div>

                                    </div>

                                )}

                            </div>

                        </div>

                    ))}

                    <div ref={bottomRef} />

                </div>


                {error && <div className="chat-error">{error}</div>}


                <form className="chat-input-row" onSubmit={handleSubmit}>

                    <input
                        type="text"
                        placeholder={t("chat_placeholder")}
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        disabled={asking}
                    />

                    <button type="submit" className="chat-send-btn" disabled={asking || !question.trim()} aria-label="Send message">

                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M4 12 20 4l-6.5 16-2.7-7.3L4 12Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round" fill="currentColor" />
                        </svg>

                    </button>

                </form>

                <p className="chat-disclaimer">

                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M12 3.5 19 6.5v5c0 5-3 8.5-7 9.5-4-1-7-4.5-7-9.5v-5l7-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                    </svg>

                    {t("chat_disclaimer")}

                </p>

            </section>

        </div>

    );

}


export default ChatPanel;
