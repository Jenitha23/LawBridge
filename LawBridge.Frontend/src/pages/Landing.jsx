import { useNavigate } from "react-router-dom";
import "./Landing.css";
import logo from "../assets/logo.png";
import heroIllustration from "../assets/hero-illustration.jpg";
import aboutIllustration from "../assets/about-illustration.jpg";
import contactIllustration from "../assets/contact-illustration.jpg";
import stepAskIcon from "../assets/step-ask.png";
import stepSearchIcon from "../assets/step-search.png";
import stepAiIcon from "../assets/step-ai.png";
import stepChecklistIcon from "../assets/step-checklist.png";


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


            {/* ---------- About ---------- */}
            <section className="section about-section" id="about">

                <div className="about-grid">

                    <div
                        className="about-visual"
                        style={{ backgroundImage: `url(${aboutIllustration})` }}
                    />

                    <div className="about-content">
                        <h2 className="align-left">
                            About <span className="accent">LawBridge</span>
                        </h2>
                        <p className="about-lead">
                            Empowering every Sri Lankan with accessible legal knowledge.
                        </p>

                        <p>
                            LawBridge is an AI-powered legal awareness platform designed to help
                            people understand their legal rights in simple language. Many
                            individuals struggle to access reliable legal information because
                            legal documents are often complex and difficult to understand.
                            LawBridge bridges this gap by providing first-step legal guidance
                            using Artificial Intelligence and Retrieval-Augmented Generation (RAG).
                        </p>

                        <p>
                            The platform supports Sinhala, Tamil, and English, making legal
                            information more accessible to everyone in Sri Lanka. While LawBridge
                            does not replace professional legal advice, it helps users understand
                            their rights, relevant laws, and possible next steps before consulting
                            a lawyer.
                        </p>
                    </div>

                    <div className="about-points">

                        <div className="point">
                            <div className="icon-badge">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#4F32C4" strokeWidth="1.6"/><path d="M12 8v4l3 2" stroke="#4F32C4" strokeWidth="1.6" strokeLinecap="round"/></svg>
                            </div>
                            <div>
                                <h4>AI Legal Assistant</h4>
                                <p>Receive instant answers to common legal questions.</p>
                            </div>
                        </div>

                        <div className="point">
                            <div className="icon-badge">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 3 3 7v4c0 5.2 3.6 9.4 9 10 5.4-.6 9-4.8 9-10V7l-9-4z" stroke="#4F32C4" strokeWidth="1.6" strokeLinejoin="round"/></svg>
                            </div>
                            <div>
                                <h4>Multilingual Support</h4>
                                <p>Get legal guidance in Sinhala, Tamil, and English.</p>
                            </div>
                        </div>

                        <div className="point">
                            <div className="icon-badge">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="#4F32C4" strokeWidth="1.6"/><path d="M12 3v3M12 18v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M3 12h3M18 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" stroke="#4F32C4" strokeWidth="1.6" strokeLinecap="round"/></svg>
                            </div>
                            <div>
                                <h4>Reliable Legal Sources</h4>
                                <p>Answers are generated using verified Sri Lankan legal documents.</p>
                            </div>
                        </div>

                        <div className="point">
                            <div className="icon-badge">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="9" rx="2" stroke="#4F32C4" strokeWidth="1.6"/><path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="#4F32C4" strokeWidth="1.6" strokeLinecap="round"/></svg>
                            </div>
                            <div>
                                <h4>Secure &amp; Private</h4>
                                <p>Your conversations are securely stored and protected.</p>
                            </div>
                        </div>

                    </div>

                </div>

            </section>


            {/* ---------- How It Works ---------- */}
            <section className="section how-section" id="how-it-works">

                <h2>
                    How <span className="accent">LawBridge</span> Works
                </h2>

                <div className="steps-row">

                    <div className="step-card">
                        <div className="step-number">1</div>
                        <div className="step-icon">
                            <img src={stepAskIcon} alt="" />
                        </div>
                        <h4>Ask Your Question</h4>
                        <p>Type your legal question in Sinhala, Tamil, or English.</p>
                        <p className="step-example">Example: My employer did not pay my salary. What should I do?</p>
                    </div>

                    <div className="step-arrow">&rarr;</div>

                    <div className="step-card">
                        <div className="step-number">2</div>
                        <div className="step-icon">
                            <img src={stepSearchIcon} alt="" />
                        </div>
                        <h4>AI Searches Legal Knowledge</h4>
                        <p>LawBridge searches its legal knowledge base to find the most relevant Sri Lankan laws and regulations related to your question.</p>
                    </div>

                    <div className="step-arrow">&rarr;</div>

                    <div className="step-card">
                        <div className="step-number">3</div>
                        <div className="step-icon">
                            <img src={stepAiIcon} alt="" />
                        </div>
                        <h4>AI Generates an Answer</h4>
                        <p>Using the retrieved legal information, the AI generates a clear and easy-to-understand explanation.</p>
                    </div>

                    <div className="step-arrow">&rarr;</div>

                    <div className="step-card">
                        <div className="step-number">4</div>
                        <div className="step-icon">
                            <img src={stepChecklistIcon} alt="" />
                        </div>
                        <h4>Get Practical Guidance</h4>
                        <p>The response includes:</p>
                        <ul className="step-list">
                            <li>Explanation</li>
                            <li>Relevant legal information</li>
                            <li>Possible actions</li>
                            <li>Required documents</li>
                            <li>When to consult a lawyer</li>
                        </ul>
                    </div>

                </div>

            </section>


            {/* ---------- Legal Topics ---------- */}
            <section className="section topics-section">

                <h2>Explore Legal Topics</h2>

                <div className="topics-grid">

                    <div className="topic-card">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="2.5" stroke="#4F32C4" strokeWidth="1.6"/><path d="M4 21c1.5-5 5-7 8-7s6.5 2 8 7" stroke="#4F32C4" strokeWidth="1.6" strokeLinecap="round"/><path d="M9 12h6" stroke="#4F32C4" strokeWidth="1.6" strokeLinecap="round"/></svg>
                        <span>Labour Law</span>
                    </div>

                    <div className="topic-card">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M4 11 12 4l8 7" stroke="#4F32C4" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 10v10h12V10" stroke="#4F32C4" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 20v-5h4v5" stroke="#4F32C4" strokeWidth="1.6"/></svg>
                        <span>Landlord &amp; Tenant</span>
                    </div>

                    <div className="topic-card">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="8" cy="7" r="2.4" stroke="#4F32C4" strokeWidth="1.6"/><circle cx="16" cy="7" r="2.4" stroke="#4F32C4" strokeWidth="1.6"/><path d="M2.5 20c.8-3.3 3-5 5.5-5s4.7 1.7 5.5 5M10.5 20c.8-3.3 3-5 5.5-5s4.7 1.7 5.5 5" stroke="#4F32C4" strokeWidth="1.6" strokeLinecap="round"/></svg>
                        <span>Family Law</span>
                    </div>

                    <div className="topic-card">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="7" cy="16" r="3" stroke="#4F32C4" strokeWidth="1.6"/><circle cx="17" cy="16" r="3" stroke="#4F32C4" strokeWidth="1.6"/><path d="M9 14l3-6 3 6M9 8h6" stroke="#4F32C4" strokeWidth="1.6" strokeLinecap="round"/></svg>
                        <span>Criminal Law</span>
                    </div>

                    <div className="topic-card">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M3 4h2l2.2 11a2 2 0 0 0 2 1.6h7a2 2 0 0 0 2-1.6L20 8H6" stroke="#4F32C4" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><circle cx="9.5" cy="20" r="1.4" stroke="#4F32C4" strokeWidth="1.4"/><circle cx="17" cy="20" r="1.4" stroke="#4F32C4" strokeWidth="1.4"/></svg>
                        <span>Consumer Rights</span>
                    </div>

                    <div className="topic-card">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><rect x="4" y="8" width="16" height="11" rx="2" stroke="#4F32C4" strokeWidth="1.6"/><path d="M9 8V6a3 3 0 0 1 6 0v2" stroke="#4F32C4" strokeWidth="1.6" strokeLinecap="round"/></svg>
                        <span>Employment</span>
                    </div>

                    <div className="topic-card">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M4 16 6 9a2 2 0 0 1 2-1.4h8A2 2 0 0 1 18 9l2 7" stroke="#4F32C4" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><rect x="3" y="16" width="18" height="4" rx="1.5" stroke="#4F32C4" strokeWidth="1.6"/><circle cx="7.5" cy="20" r="1.2" stroke="#4F32C4" strokeWidth="1.4"/><circle cx="16.5" cy="20" r="1.2" stroke="#4F32C4" strokeWidth="1.4"/></svg>
                        <span>Traffic Law</span>
                    </div>

                    <div className="topic-card">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="8" cy="8" r="2.6" stroke="#4F32C4" strokeWidth="1.6"/><circle cx="16" cy="8" r="2.6" stroke="#4F32C4" strokeWidth="1.6"/><path d="M2.5 19.5c.7-3 2.8-4.5 5.5-4.5s4.8 1.5 5.5 4.5M10.5 19.5c.7-3 2.8-4.5 5.5-4.5s4.8 1.5 5.5 4.5" stroke="#4F32C4" strokeWidth="1.6" strokeLinecap="round"/></svg>
                        <span>Civil Rights</span>
                    </div>

                </div>

            </section>


            {/* ---------- Why Choose ---------- */}
            <section className="why-section">

                <h2>
                    Why Choose <span className="accent">LawBridge</span>?
                </h2>

                <div className="why-grid">

                    <div className="why-item">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" stroke="#F5A623" strokeWidth="1.6" strokeLinejoin="round"/></svg>
                        <div>
                            <h4>Instant Guidance</h4>
                            <p>Get legal answers within seconds.</p>
                        </div>
                    </div>

                    <div className="why-item">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#4F32C4" strokeWidth="1.6"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z" stroke="#4F32C4" strokeWidth="1.6"/></svg>
                        <div>
                            <h4>Multilingual</h4>
                            <p>Available in Sinhala, Tamil, and English.</p>
                        </div>
                    </div>

                    <div className="why-item">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 5v13a2 2 0 0 0 2 2h4V5H4z" stroke="#4F32C4" strokeWidth="1.6" strokeLinejoin="round"/><path d="M20 5v13a2 2 0 0 1-2 2h-4V5h6z" stroke="#4F32C4" strokeWidth="1.6" strokeLinejoin="round"/></svg>
                        <div>
                            <h4>Based on Sri Lankan Laws</h4>
                            <p>Answers are generated using relevant legal documents.</p>
                        </div>
                    </div>

                    <div className="why-item">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2 4 5v6c0 5 3.4 9 8 11 4.6-2 8-6 8-11V5l-8-3z" stroke="#4F32C4" strokeWidth="1.6" strokeLinejoin="round"/><path d="m9.5 12 1.8 1.8L15 10" stroke="#4F32C4" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        <div>
                            <h4>Secure</h4>
                            <p>User accounts and conversations are securely protected.</p>
                        </div>
                    </div>

                    <div className="why-item">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="#4F32C4" strokeWidth="1.6"/><circle cx="12" cy="12" r="4" stroke="#4F32C4" strokeWidth="1.6"/><circle cx="12" cy="12" r="1" fill="#4F32C4"/></svg>
                        <div>
                            <h4>Easy to Understand</h4>
                            <p>Legal information is simplified into plain language.</p>
                        </div>
                    </div>

                </div>

            </section>


            {/* ---------- Contact ---------- */}
            <section className="section contact-section" id="contact">

                <div className="contact-grid">

                    <div className="contact-info">
                        <h2 className="align-left">Contact Us</h2>
                        <p>Have questions or feedback? We'd love to hear from you.</p>

                        <div className="contact-line">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" stroke="#4F32C4" strokeWidth="1.6"/><path d="m4 7 8 6 8-6" stroke="#4F32C4" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            <span>support@lawbridge.lk</span>
                        </div>

                        <div className="contact-line">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 4h3l1.5 5-2 1.5a12 12 0 0 0 6 6l1.5-2 5 1.5v3a2 2 0 0 1-2 2C10.5 21 3 13.5 3 6a2 2 0 0 1 2-2z" stroke="#4F32C4" strokeWidth="1.6" strokeLinejoin="round"/></svg>
                            <span>+94 71 XXX XXXX</span>
                        </div>

                        <div className="contact-line">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 21s7-6.3 7-11.5A7 7 0 0 0 5 9.5C5 14.7 12 21 12 21z" stroke="#4F32C4" strokeWidth="1.6" strokeLinejoin="round"/><circle cx="12" cy="9.5" r="2.4" stroke="#4F32C4" strokeWidth="1.6"/></svg>
                            <span>Colombo, Sri Lanka</span>
                        </div>
                    </div>

                    <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
                        <div className="form-row">
                            <input type="text" placeholder="Your Name" />
                            <input type="email" placeholder="Email Address" />
                        </div>
                        <input type="text" placeholder="Subject" />
                        <textarea rows="4" placeholder="Message" />
                        <button type="submit" className="btn btn-primary">Send Message</button>
                    </form>

                    <div
                        className="contact-visual"
                        style={{ backgroundImage: `url(${contactIllustration})` }}
                    />

                </div>

            </section>


            {/* ---------- FAQ ---------- */}
            <section className="section faq-section">

                <h2>Frequently Asked Questions</h2>

                <div className="faq-grid">

                    <details className="faq-item">
                        <summary>Is LawBridge free to use?<span className="chevron">&#9662;</span></summary>
                        <p>Yes, LawBridge is completely free for everyone to use.</p>
                    </details>

                    <details className="faq-item">
                        <summary>Can I upload legal documents?<span className="chevron">&#9662;</span></summary>
                        <p>Document upload and explanation support is being added to LawBridge.</p>
                    </details>

                    <details className="faq-item">
                        <summary>Does LawBridge replace a lawyer?<span className="chevron">&#9662;</span></summary>
                        <p>No, LawBridge provides first-step guidance and does not replace professional legal advice.</p>
                    </details>

                    <details className="faq-item">
                        <summary>Are my chats private?<span className="chevron">&#9662;</span></summary>
                        <p>Yes, your conversations are securely stored and protected.</p>
                    </details>

                    <details className="faq-item">
                        <summary>What languages are supported?<span className="chevron">&#9662;</span></summary>
                        <p>LawBridge supports Sinhala, Tamil, and English.</p>
                    </details>

                    <details className="faq-item">
                        <summary>What if I need more help?<span className="chevron">&#9662;</span></summary>
                        <p>You can reach our team anytime through the contact form above.</p>
                    </details>

                </div>

            </section>


            {/* ---------- Footer ---------- */}
            <footer className="footer">
                <div className="footer-container">

                    <div className="footer-col footer-brand">
                        <div className="brand footer-logo">
                            <img src={logo} alt="LawBridge logo" className="brand-logo" />
                            <span>LawBridge</span>
                        </div>
                        <p>AI-powered legal awareness platform for everyone in Sri Lanka.</p>
                        <div className="social-icons">
                            <a href="#" aria-label="Facebook"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 8h2V5h-2a4 4 0 0 0-4 4v2H9v3h2v7h3v-7h2.5l.5-3H14v-2a1 1 0 0 1 1-1z" stroke="white" strokeWidth="1.3" strokeLinejoin="round"/></svg></a>
                            <a href="#" aria-label="Twitter"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 4l16 16M20 4 4 20" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg></a>
                            <a href="#" aria-label="LinkedIn"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="3" stroke="white" strokeWidth="1.3"/><path d="M7 10v7M7 7v.01M11 17v-4.5a2 2 0 0 1 4 0V17M11 17h4" stroke="white" strokeWidth="1.3" strokeLinecap="round"/></svg></a>
                            <a href="#" aria-label="YouTube"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="18" height="12" rx="3" stroke="white" strokeWidth="1.3"/><path d="M11 9.5v5l4-2.5-4-2.5z" fill="white"/></svg></a>
                        </div>
                    </div>

                    <div className="footer-col">
                        <h5>Quick Links</h5>
                        <a>Home</a>
                        <a href="#about">About</a>
                        <a href="#how-it-works">How It Works</a>
                        <a href="#features">Legal Topics</a>
                        <a href="#contact">Contact</a>
                    </div>

                    <div className="footer-col">
                        <h5>Resources</h5>
                        <a>Privacy Policy</a>
                        <a>Terms &amp; Conditions</a>
                    </div>

                    <div className="footer-col">
                        <h5>Contact</h5>
                        <span>support@lawbridge.lk</span>
                        <span>+94 71 XXX XXXX</span>
                        <span>Colombo, Sri Lanka</span>
                    </div>

                </div>

                <div className="footer-bottom">
                    &copy; 2026 LawBridge. All Rights Reserved.
                </div>
            </footer>

        </div>

    );

}


export default Landing;