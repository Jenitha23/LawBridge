import { useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { getChatHistory, deleteChat } from "../../services/chatService";
import "./Settings.css";


const LANGUAGES = ["English", "Sinhala", "Tamil"];

const FONT_SIZES = [
    { label: "Small", value: "0.9" },
    { label: "Medium", value: "1" },
    { label: "Large", value: "1.15" }
];

const FONT_SIZE_STORAGE_KEY = "lawbridge_font_scale";


function getStoredFontSize()
{
    const stored = localStorage.getItem(FONT_SIZE_STORAGE_KEY);

    return FONT_SIZES.some((f) => f.value === stored) ? stored : "1";
}


function Settings()
{

    const { isDark, toggleTheme } = useTheme();

    const { language, setLanguage } = useLanguage();

    const [fontSize, setFontSize] = useState(getStoredFontSize());

    const [clearing, setClearing] = useState(false);

    const [clearMessage, setClearMessage] = useState({ type: "", text: "" });


    const handleFontSizeChange = (e) =>
    {

        const value = e.target.value;

        setFontSize(value);

        localStorage.setItem(FONT_SIZE_STORAGE_KEY, value);

        document.documentElement.style.setProperty("--font-scale", value);

    };


    const handleClearHistory = async () =>
    {

        if (!window.confirm("Clear your entire chat history? This can't be undone.")) return;

        setClearing(true);

        setClearMessage({ type: "", text: "" });

        try
        {
            const history = await getChatHistory();

            await Promise.all(history.map((h) => deleteChat(h.id)));

            setClearMessage({ type: "success", text: "Your chat history has been cleared." });
        }
        catch (err)
        {
            setClearMessage({

                type: "error",

                text: err.response?.data?.message || "Could not clear your chat history."

            });
        }
        finally
        {
            setClearing(false);
        }

    };


    return (

        <DashboardLayout title="Settings">

            {() => (

                <div className="settings-card">

                    <h3>General Settings</h3>


                    <div className="settings-row">

                        <div className="settings-row-text">
                            <span className="settings-label">Dark Mode</span>
                            <span className="settings-hint">Switch the app to a darker color theme.</span>
                        </div>

                        <button
                            type="button"
                            className={`settings-switch ${isDark ? "on" : ""}`}
                            role="switch"
                            aria-checked={isDark}
                            aria-label="Toggle dark mode"
                            onClick={toggleTheme}
                        >
                            <span className="settings-switch-thumb" />
                        </button>

                    </div>


                    <div className="settings-row">

                        <div className="settings-row-text">
                            <span className="settings-label">Language</span>
                            <span className="settings-hint">Choose the language used across LawBridge.</span>
                        </div>

                        <select
                            className="settings-select"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                        >
                            {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                        </select>

                    </div>


                    <div className="settings-row">

                        <div className="settings-row-text">
                            <span className="settings-label">Font Size</span>
                            <span className="settings-hint">Adjust the text size for easier reading.</span>
                        </div>

                        <select
                            className="settings-select"
                            value={fontSize}
                            onChange={handleFontSizeChange}
                        >
                            {FONT_SIZES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                        </select>

                    </div>


                    <div className="settings-row">

                        <div className="settings-row-text">
                            <span className="settings-label">Clear Chat History</span>
                            <span className="settings-hint">Permanently delete all your past conversations.</span>
                        </div>

                        <button
                            type="button"
                            className="settings-clear-btn"
                            onClick={handleClearHistory}
                            disabled={clearing}
                        >
                            {clearing ? "Clearing..." : "Clear"}
                        </button>

                    </div>


                    {clearMessage.text && (

                        <div className={`settings-message ${clearMessage.type}`}>
                            {clearMessage.text}
                        </div>

                    )}

                </div>

            )}

        </DashboardLayout>

    );

}


export default Settings;
