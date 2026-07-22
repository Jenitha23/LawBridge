import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { askQuestion, getChatDetail, getChatHistory, setChatSaved } from "../../services/chatService";
import chatLogo from "../../assets/logo.png";
import "./ChatPanel.css";


const LANGUAGES = ["English", "Sinhala", "Tamil"];

const EXAMPLE_QUESTIONS = [
    "My employer did not pay my salary, what should I do?",
    "My landlord wants to remove me suddenly, what are my rights?",
    "I received a defective product, can I get a refund?"
];


function formatClockTime(date)
{
    if (!date) return "";

    const d = date instanceof Date ? date : new Date(date);

    if (Number.isNaN(d.getTime())) return "";

    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}


function formatRelativeTime(dateString)
{
    if (!dateString) return "";

    const then = new Date(dateString).getTime();

    if (Number.isNaN(then)) return "";

    const diffMs = Date.now() - then;

    const minutes = Math.floor(diffMs / 60000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min${minutes === 1 ? "" : "s"} ago`;

    const hours = Math.floor(minutes / 60);

    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

    const days = Math.floor(hours / 24);

    if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;

    return new Date(dateString).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}


function AnswerCard({ answer, onToggleSave })
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
                        title={answer.isSaved ? "Remove from saved" : "Save this answer"}
                    >
                        {answer.isSaved ? "★ Saved" : "☆ Save"}
                    </button>

                )}

            </div>

            {answer.translationNote && (
                <div className="chat-translation-note">{answer.translationNote}</div>
            )}

            <h4>Explanation</h4>
            <p>{answer.explanation}</p>

            {answer.relevantLegalInfo && (

                <>
                    <h4>Relevant Legal Information</h4>
                    <p>{answer.relevantLegalInfo}</p>
                </>

            )}

            {answer.possibleActions?.length > 0 && (

                <>
                    <h4>Possible Actions</h4>
                    <ul>
                        {answer.possibleActions.map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                </>

            )}

            {answer.requiredDocuments?.length > 0 && (

                <>
                    <h4>Documents You May Need</h4>
                    <ul>
                        {answer.requiredDocuments.map((d, i) => <li key={i}>{d}</li>)}
                    </ul>
                </>

            )}

            {answer.whenToConsultLawyer && (

                <div className="chat-lawyer-note">
                    <strong>When to consult a lawyer:</strong> {answer.whenToConsultLawyer}
                </div>

            )}

            {answer.sources?.length > 0 && (

                <div className="chat-sources">
                    Sources: {answer.sources.join(", ")}
                </div>

            )}

        </div>

    );

}


function ChatPanel({ historyId, user })
{

    const navigate = useNavigate();

    const [messages, setMessages] = useState([]);

    const [question, setQuestion] = useState("");

    const [language, setLanguage] = useState("English");

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

                setLanguage(detail.language || "English");
            })
            .catch((err) =>
            {
                if (cancelled) return;

                setError(
                    err.response?.data?.message ||
                    "Could not load this conversation."
                );
            })
            .finally(() =>
            {
                if (!cancelled) setLoadingHistory(false);
            });


        return () => { cancelled = true; };

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
            const answer = await askQuestion(q, language);

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
                "Something went wrong while getting your answer. Please try again."
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
                "Could not update saved status."
            );
        }

    };


    const handleSubmit = (e) =>
    {
        e.preventDefault();

        handleAsk();
    };


    return (

        <div className="chat-layout">

            <aside className="recent-chats-panel">

                <div className="recent-chats-header">
                    <h3>Recent Chats</h3>
                    <button onClick={() => navigate("/dashboard?new=1")}>+ New Chat</button>
                </div>

                <div className="recent-chats-list">

                    {loadingRecent && <p className="chat-muted recent-chats-loading">Loading…</p>}

                    {!loadingRecent && recentChats.length === 0 && (
                        <p className="chat-muted recent-chats-loading">No conversations yet.</p>
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
                                <span className="recent-chat-time">{formatRelativeTime(h.createdAt)}</span>
                            </span>

                        </button>

                    ))}

                </div>

                <button className="view-all-chats-link" onClick={() => navigate("/chats")}>
                    View All Chats <span aria-hidden="true">→</span>
                </button>

            </aside>


            <section className="chat-panel">

                <div className="chat-panel-header">

                    <div className="chat-panel-title">
                        <h2>Chat with <span className="accent">LawBridge AI</span></h2>
                        <p>Your AI legal assistant for Sri Lankan laws.</p>
                    </div>

                    <select
                        className="chat-language-select"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                    >
                        {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>

                </div>


                <div className="chat-thread">

                    {loadingHistory && <p className="chat-muted">Loading conversation…</p>}

                    {!loadingHistory && messages.length === 0 && (

                        <div className="chat-empty-state">

                            <div className="chat-msg chat-msg-ai">

                                <img src={chatLogo} alt="" className="chat-avatar" />

                                <div className="chat-msg-body">

                                    <div className="chat-bubble chat-bubble-ai">
                                        <p>Hello {firstName}! 👋</p>
                                        <p>I&apos;m LawBridge AI, your legal assistant.</p>
                                        <p>I can help you understand legal information based on Sri Lankan laws. How can I assist you today?</p>
                                    </div>

                                    <span className="chat-timestamp">{formatClockTime(new Date())}</span>

                                </div>

                            </div>

                            <div className="chat-examples">

                                {EXAMPLE_QUESTIONS.map((ex) => (
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

                                        <AnswerCard answer={m.answer} onToggleSave={handleToggleSave} />

                                        <span className="chat-timestamp">{formatClockTime(m.askedAt)}</span>

                                    </div>

                                ) : (

                                    <div className="chat-msg-body">

                                        <div className="chat-bubble chat-bubble-ai chat-thinking">
                                            <span className="chat-thinking-label">LawBridge AI is typing</span>
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
                        placeholder="Type your message..."
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

                    LawBridge provides legal awareness, not legal advice.

                </p>

            </section>

        </div>

    );

}


export default ChatPanel;
