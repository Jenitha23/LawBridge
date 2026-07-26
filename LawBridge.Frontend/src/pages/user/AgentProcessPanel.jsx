import "./AgentProcessPanel.css";


// Maps the backend's stable step "key" (see LegalChatService.Ask trace
// entries) to a display icon and colour. Purely cosmetic — the content
// shown next to each icon is the real detail string the backend produced
// for that specific request, not scripted copy.
const STEP_ICON = {
    understand: "💬",
    classify: "🏷️",
    embed: "🧬",
    retrieve: "🗄️",
    sources: "📄",
    context: "🧩",
    reason: "🧠",
    guardrail: "🛡️",
    clarify: "❓",
    translate: "🌐",
    memory: "💾",
    extract: "🔎",
    explain: "🧠",
};


function StatusBadge({ status })
{
    if (status === "fallback")
    {
        return <span className="agent-step-badge agent-step-badge-fallback">Fallback</span>;
    }

    if (status === "warning")
    {
        return <span className="agent-step-badge agent-step-badge-warning">Fell back</span>;
    }

    return <span className="agent-step-badge agent-step-badge-done">✓</span>;
}


function AgentProcessPanel({ trace, question, onClose, label = "Question:", emptyHint }) 
{

    const totalMs = (trace || []).reduce((sum, s) => sum + (s.DurationMs ?? s.durationMs ?? 0), 0);

    const hint = emptyHint || "Ask a question in the chat — every real step the agent takes (category classification, vector retrieval, reasoning, translation, memory) will appear here as it actually happens.";

    return (

        <aside className="agent-process-panel">

            <div className="agent-process-header">

                <div className="agent-process-title">
                    <span className="agent-process-icon">🤖</span>
                    <div>
                        <h3>AI Agent Process</h3>
                        <p>Real steps for this request — not simulated</p>
                    </div>
                </div>

                {onClose && (
                    <button className="agent-process-close" onClick={onClose} aria-label="Hide agent process panel">
                        ✕
                    </button>
                )}

            </div>

            {question && (
                <div className="agent-process-question">
                    <span>{label}</span> “{question}”
                </div>
            )}

            <div className="agent-process-steps">

                {(!trace || trace.length === 0) && (
                    <p className="agent-process-empty">
                        {hint}
                    </p>
                )}

                {trace && trace.map((step, i) =>
                {
                    const key = step.Key ?? step.key;
                    const title = step.Title ?? step.title;
                    const detail = step.Detail ?? step.detail;
                    const status = step.Status ?? step.status;
                    const durationMs = step.DurationMs ?? step.durationMs;
                    const stepNo = step.Step ?? step.step ?? i + 1;

                    return (

                        <div className="agent-step" key={stepNo}>

                            <div className="agent-step-rail">
                                <span className="agent-step-number">{stepNo}</span>
                                {i < trace.length - 1 && <span className="agent-step-line" />}
                            </div>

                            <div className="agent-step-icon-badge">{STEP_ICON[key] || "⚙️"}</div>

                            <div className="agent-step-body">

                                <div className="agent-step-top">
                                    <h4>{title}</h4>
                                    <StatusBadge status={status} />
                                </div>

                                <p>{detail}</p>

                                {typeof durationMs === "number" && durationMs > 0 && (
                                    <span className="agent-step-duration">{durationMs} ms</span>
                                )}

                            </div>

                        </div>

                    );

                })}

            </div>

            {trace && trace.length > 0 && (
                <div className="agent-process-footer">
                    <span>{trace.length} steps</span>
                    <span>·</span>
                    <span>{totalMs} ms total</span>
                </div>
            )}

        </aside>

    );

}


export default AgentProcessPanel;