import { useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { getChatHistory, deleteChat } from "../../services/chatService";
import { updateProfile } from "../../services/userService";
import "./Settings.css";


const LANGUAGES = ["English", "Sinhala", "Tamil"];

const FONT_SIZES = [
    { labelKey: "settings_font_small", value: "0.9" },
    { labelKey: "settings_font_medium", value: "1" },
    { labelKey: "settings_font_large", value: "1.15" }
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

    const { language, setLanguage, t } = useLanguage();

    const [fontSize, setFontSize] = useState(getStoredFontSize());

    const [clearing, setClearing] = useState(false);

    const [clearMessage, setClearMessage] = useState({ type: "", text: "" });

    const [langMessage, setLangMessage] = useState("");


    const handleLanguageChange = async (e, user) =>
    {

        const value = e.target.value;

        // Translate immediately...
        setLanguage(value);

        setLangMessage("");

        // ...and persist it to the backend, otherwise DashboardLayout will
        // overwrite this choice with the old saved value on the next reload.
        try
        {
            await updateProfile({

                name: user?.name,
                phoneNumber: user?.phoneNumber,
                address: user?.address,
                preferredLanguage: value

            });
        }
        catch (err)
        {
            setLangMessage(
                err.response?.data?.message || t("profile_update_failed")
            );
        }

    };


    const handleFontSizeChange = (e) =>
    {

        const value = e.target.value;

        setFontSize(value);

        localStorage.setItem(FONT_SIZE_STORAGE_KEY, value);

        document.documentElement.style.setProperty("--font-scale", value);

    };


    const handleClearHistory = async () =>
    {

        if (!window.confirm(t("settings_clear_confirm"))) return;

        setClearing(true);

        setClearMessage({ type: "", text: "" });

        try
        {
            const history = await getChatHistory();

            await Promise.all(history.map((h) => deleteChat(h.id)));

            setClearMessage({ type: "success", text: t("settings_clear_success") });
        }
        catch (err)
        {
            setClearMessage({

                type: "error",

                text: err.response?.data?.message || t("settings_clear_failed")

            });
        }
        finally
        {
            setClearing(false);
        }

    };


    return (

        <DashboardLayout title={t("nav_settings")}>

            {({ user }) => (

                <div className="settings-card">

                    <h3>{t("settings_general")}</h3>


                    <div className="settings-row">

                        <div className="settings-row-text">
                            <span className="settings-label">{t("settings_dark_mode")}</span>
                            <span className="settings-hint">{t("settings_dark_mode_hint")}</span>
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
                            <span className="settings-label">{t("profile_language")}</span>
                            <span className="settings-hint">{t("settings_language_hint")}</span>
                        </div>

                        <select
                            className="settings-select"
                            value={language}
                            onChange={(e) => handleLanguageChange(e, user)}
                        >
                            {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                        </select>

                    </div>

                    {langMessage && (

                        <div className="settings-message error">
                            {langMessage}
                        </div>

                    )}


                    <div className="settings-row">

                        <div className="settings-row-text">
                            <span className="settings-label">{t("settings_font_size")}</span>
                            <span className="settings-hint">{t("settings_font_size_hint")}</span>
                        </div>

                        <select
                            className="settings-select"
                            value={fontSize}
                            onChange={handleFontSizeChange}
                        >
                            {FONT_SIZES.map((f) => <option key={f.value} value={f.value}>{t(f.labelKey)}</option>)}
                        </select>

                    </div>


                    <div className="settings-row">

                        <div className="settings-row-text">
                            <span className="settings-label">{t("settings_clear_history")}</span>
                            <span className="settings-hint">{t("settings_clear_history_hint")}</span>
                        </div>

                        <button
                            type="button"
                            className="settings-clear-btn"
                            onClick={handleClearHistory}
                            disabled={clearing}
                        >
                            {clearing ? t("settings_clearing") : t("settings_clear_btn")}
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
