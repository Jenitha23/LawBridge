import { useEffect, useRef, useState } from "react";
import { askQuestion, getChatDetail } from "../../services/chatService";
import "./ChatPanel.css";


const LANGUAGES = ["English", "Sinhala", "Tamil"];

const EXAMPLE_QUESTIONS = [
    "My employer did not pay my salary, what should I do?",
    "My landlord wants to remove me suddenly, what are my rights?",
    "I received a defective product, can I get a refund?"
];


function AnswerCard({ answer })
{

    return (

        <div className="chat-answer-card">

            {answer.category && (
                <span className="chat-category-pill">{answer.category}</span>
            )}

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


function ChatPanel({ historyId })
{

    const [messages, setMessages] = useState([]);

    const [question, setQuestion] = useState("");

    const [language, setLanguage] = useState("English");

    const [asking, setAsking] = useState(false);

    const [error, setError] = useState("");

    const [loadingHistory, setLoadingHistory] = useState(!!historyId);

    const bottomRef = useRef(null);


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

                setMessages([{ question: detail.question, answer: detail }]);
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
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });

    }, [messages, asking]);


    const handleAsk = async (text) =>
    {

        const q = (text ?? question).trim();

        if (!q || asking) return;


        setQuestion("");

        setError("");

        setAsking(true);

        setMessages((prev) => [...prev, { question: q, answer: null }]);


        try
        {
            const answer = await askQuestion(q, language);

            setMessages((prev) =>
            {
                const next = [...prev];

                next[next.length - 1] = { question: q, answer };

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


    const handleSubmit = (e) =>
    {
        e.preventDefault();

        handleAsk();
    };


    const isReadOnlyHistory = !!historyId;


    return (

        <section className="chat-panel">

            <div className="chat-panel-header">

                <h2>AI Legal Chat Assistant</h2>

                {!isReadOnlyHistory && (

                    <select
                        className="chat-language-select"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                    >
                        {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>

                )}

            </div>


            <div className="chat-thread">

                {loadingHistory && <p className="chat-muted">Loading conversation…</p>}

                {!loadingHistory && messages.length === 0 && (

                    <div className="chat-empty-state">

                        <p>Ask a legal question in English, Sinhala, or Tamil to get started.</p>

                        <div className="chat-examples">

                            {EXAMPLE_QUESTIONS.map((ex) => (
                                <button key={ex} onClick={() => handleAsk(ex)}>{ex}</button>
                            ))}

                        </div>

                    </div>

                )}

                {messages.map((m, i) => (

                    <div className="chat-exchange" key={i}>

                        <div className="chat-question-bubble">{m.question}</div>

                        {m.answer ? (
                            <AnswerCard answer={m.answer} />
                        ) : (
                            <div className="chat-thinking">
                                <span /><span /><span />
                                Thinking…
                            </div>
                        )}

                    </div>

                ))}

                <div ref={bottomRef} />

            </div>


            {error && <div className="chat-error">{error}</div>}


            {!isReadOnlyHistory && (

                <form className="chat-input-row" onSubmit={handleSubmit}>

                    <input
                        type="text"
                        placeholder="Type your legal question..."
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        disabled={asking}
                    />

                    <button type="submit" disabled={asking || !question.trim()}>
                        {asking ? "Asking..." : "Ask"}
                    </button>

                </form>

            )}

        </section>

    );

}


export default ChatPanel;
