import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import {
AuthProvider
}
from "./context/AuthContext.jsx";
import { LanguageProvider } from "./context/LanguageContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";


// Apply any saved theme / font-size preference before the first paint so
// there's no light-mode flash for users who already chose dark mode.
const savedTheme = localStorage.getItem("lawbridge_theme");
if (savedTheme === "dark")
{
    document.documentElement.setAttribute("data-theme", "dark");
}

const savedFontScale = localStorage.getItem("lawbridge_font_scale");
if (savedFontScale)
{
    document.documentElement.style.setProperty("--font-scale", savedFontScale);
}


ReactDOM.createRoot(
document.getElementById("root")
)
.render(

<AuthProvider>

<LanguageProvider>

<ThemeProvider>

<App/>

</ThemeProvider>

</LanguageProvider>

</AuthProvider>

);