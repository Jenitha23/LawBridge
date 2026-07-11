import { useNavigate } from "react-router-dom";
import "./Landing.css";
import logo from "../assets/logo.png";
import heroIllustration from "../assets/hero-illustration.jpg";


function Landing()
{

    const navigate = useNavigate();


    return (

        <div className="page">

            <header className="navbar">
                <div className="nav-container">

                    <div className="brand">
                        <img src={logo} alt="LawBridge logo" className="brand-logo" />
                        <span>LawBridge</span>
                    </div>

                    <nav className="nav-links">
                        <a className="active">Home</a>
                        <a href="#about">About</a>
                        <a href="#how-it-works">How It Works</a>
                        <a href="#features">Legal Topics</a>
                        <a href="#contact">Contact</a>
                    </nav>

                    <div className="nav-actions">
                        <button className="btn btn-outline" onClick={() => navigate("/login")}>
                            Log In
                        </button>
                        <button className="btn btn-primary" onClick={() => navigate("/register")}>
                            Get Started
                        </button>
                    </div>

                </div>
            </header>


            <section className="hero">
                <div className="hero-container">

                    <div className="hero-content">
                        <h1>
                            Your Rights.<br/>
                            Your Voice.<br/>
                            <span className="accent">Our Support.</span>
                        </h1>

                        <p className="hero-sub">
                            AI-powered legal awareness and first-step guidance in Sinhala, Tamil, and English.
                        </p>

                        <div className="lang-pills">
                            <span className="pill">සිංහල</span>
                            <span className="pill">தமிழ்</span>
                            <span className="pill">English</span>
                        </div>

                        <div className="hero-actions">
                            <button className="btn btn-primary btn-lg" onClick={() => navigate("/register")}>
                                Get Started
                            </button>
                            <button className="btn btn-secondary btn-lg" onClick={() => navigate("/login")}>
                                Learn More
                            </button>
                        </div>
                    </div>

                    <div
                        className="hero-visual"
                        style={{ backgroundImage: `url(${heroIllustration})` }}
                    />

                </div>
            </section>


            <div className="trust-strip">
                <div className="trust-item">
                    <div className="icon-badge">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20 12v9H4v-9M2 7h20v5H2V7zM12 22V7M12 7H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7z" stroke="#4F32C4" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <div>
                        <h4>Free</h4>
                        <p>Always free to use</p>
                    </div>
                </div>

                <div className="trust-item">
                    <div className="icon-badge">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#4F32C4" strokeWidth="1.6"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z" stroke="#4F32C4" strokeWidth="1.6"/></svg>
                    </div>
                    <div>
                        <h4>Multilingual</h4>
                        <p>සිංහල | தமிழ் | English</p>
                    </div>
                </div>

                <div className="trust-item">
                    <div className="icon-badge">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2 4 5v6c0 5 3.4 9 8 11 4.6-2 8-6 8-11V5l-8-3z" stroke="#4F32C4" strokeWidth="1.6" strokeLinejoin="round"/><path d="m9.5 12 1.8 1.8L15 10" stroke="#4F32C4" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <div>
                        <h4>Trusted Info</h4>
                        <p>Based on Sri Lankan laws</p>
                    </div>
                </div>

                <div className="trust-item">
                    <div className="icon-badge">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="9" rx="2" stroke="#4F32C4" strokeWidth="1.6"/><path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="#4F32C4" strokeWidth="1.6" strokeLinecap="round"/></svg>
                    </div>
                    <div>
                        <h4>Your Privacy</h4>
                        <p>We protect your data</p>
                    </div>
                </div>
            </div>


            <section className="section" id="about">

                <h2>
                    Understand Your Legal Rights Easily
                </h2>

                <p>
                    LawBridge helps Sri Lankan citizens understand
                    legal information in Sinhala, Tamil, and English.
                    Get simple explanations, document guidance,
                    and the correct first step for common legal issues.
                </p>

                <h3 id="features">
                    Our Features
                </h3>

                <ul className="features-grid">

                    <li>
                        AI Legal Chat Assistant
                    </li>

                    <li>
                        Sinhala, Tamil & English Support
                    </li>

                    <li>
                        Legal Document Explanation
                    </li>

                    <li>
                        Trusted Sri Lankan Legal Information
                    </li>

                    <li>
                        First-Step Legal Guidance
                    </li>

                </ul>

            </section>

        </div>

    );

}


export default Landing;
