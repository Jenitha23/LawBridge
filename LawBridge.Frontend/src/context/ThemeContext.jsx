import { createContext, useContext, useState, useCallback, useEffect } from "react";


const ThemeContext = createContext();


const STORAGE_KEY = "lawbridge_theme";


function applyTheme(theme)
{
    document.documentElement.setAttribute("data-theme", theme === "dark" ? "dark" : "light");
}


export function ThemeProvider({ children })
{

    const [theme, setThemeState] = useState(() =>
    {
        const stored = localStorage.getItem(STORAGE_KEY);

        return stored === "dark" ? "dark" : "light";
    });


    // Keep the <html> attribute in sync, including on first mount.
    useEffect(() =>
    {
        applyTheme(theme);

    }, [theme]);


    const setTheme = useCallback((next) =>
    {

        const resolved = next === "dark" ? "dark" : "light";

        localStorage.setItem(STORAGE_KEY, resolved);

        setThemeState(resolved);

    }, []);


    const toggleTheme = useCallback(() =>
    {
        setTheme(theme === "dark" ? "light" : "dark");

    }, [theme, setTheme]);


    return (

        <ThemeContext.Provider value={{ theme, isDark: theme === "dark", setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>

    );

}


export function useTheme()
{

    const context = useContext(ThemeContext);

    if (!context)
    {
        throw new Error("useTheme must be used within a ThemeProvider");
    }

    return context;

}
