import { createContext, useContext, useState, useCallback } from "react";
import translations from "../i18n/translations";


const LanguageContext = createContext();


const STORAGE_KEY = "lawbridge_language";


export function LanguageProvider({ children })
{

    const [language, setLanguageState] = useState(
        localStorage.getItem(STORAGE_KEY) || "English"
    );


    const setLanguage = useCallback((lang) =>
    {

        const resolved = translations[lang] ? lang : "English";

        localStorage.setItem(STORAGE_KEY, resolved);

        setLanguageState(resolved);

    }, []);


    const t = useCallback((key) =>
    {

        return translations[language]?.[key] ?? translations.English[key] ?? key;

    }, [language]);


    return (

        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>

    );

}


export function useLanguage()
{

    const context = useContext(LanguageContext);

    if (!context)
    {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }

    return context;

}


// True once the user has actively picked a language in this browser
// (landing page, login, settings, ...). Lets pages avoid overwriting
// an already-made choice with a stale server-side default.
export function hasChosenLanguage()
{

    return Boolean(localStorage.getItem(STORAGE_KEY));

}