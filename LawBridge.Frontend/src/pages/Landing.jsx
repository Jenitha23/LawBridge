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
import { useLanguage } from "../context/LanguageContext";


const LANGUAGE_PILLS = [
    { label: "සිංහල", value: "Sinhala" },
    { label: "தமிழ்", value: "Tamil" },
    { label: "English", value: "English" }
];


function Landing()
{

    const navigate = useNavigate();

    const { language, setLanguage, t } = useLanguage();


    return (

        <div className="page">

            <header className="navbar">
                <div className="nav-container">

                    <div className="brand">
                        <img src={logo} alt="LawBridge logo" className="brand-logo" />
                        <span>LawBridge</span>
                    </div>

                    <nav className="nav-links">
                        <a className="active">{t("landing_nav_home")}</a>
                        <a href="#about">{t("landing_nav_about")}</a>
                        <a href="#how-it-works">{t("landing_nav_how")}</a>
                        <a href="#features">{t("landing_nav_topics")}</a>
                        <a href="#contact">{t("landing_nav_contact")}</a>
                    </nav>

                    <div className="nav-actions">
                        <button className="btn btn-outline" onClick={() => navigate("/login")}>
                            {t("landing_login")}
                        </button>
                        <button className="btn btn-primary" onClick={() => navigate("/register")}>
                            {t("landing_get_started")}
                        </button>
                    </div>

                </div>
            </header>


            <section className="hero">
                <div className="hero-container">

                    <div className="hero-content">
                        <h1>
                            {t("landing_hero_line1")}<br/>
                            {t("landing_hero_line2")}<br/>
                            <span className="accent">{t("landing_hero_accent")}</span>
                        </h1>

                        <p className="hero-sub">
                            {t("landing_hero_sub")}
                        </p>

                        <div className="lang-pills">
                            {LANGUAGE_PILLS.map((lp) => (
                                <button
                                    key={lp.value}
                                    type="button"
                                    className={`pill ${language === lp.value ? "active" : ""}`}
                                    onClick={() => setLanguage(lp.value)}
                                    aria-pressed={language === lp.value}
                                >
                                    {lp.label}
                                </button>
                            ))}
                        </div>

                        <div className="hero-actions">
                            <button className="btn btn-primary btn-lg" onClick={() => navigate("/register")}>
                                {t("landing_get_started")}
                            </button>
                            <button className="btn btn-secondary btn-lg" onClick={() => navigate("/login")}>
                                {t("landing_learn_more")}
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
                        <h4>{t("landing_trust_free_title")}</h4>
                        <p>{t("landing_trust_free_desc")}</p>
                    </div>
                </div>

                <div className="trust-item">
                    <div className="icon-badge">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#4F32C4" strokeWidth="1.6"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z" stroke="#4F32C4" strokeWidth="1.6"/></svg>
                    </div>
                    <div>
                        <h4>{t("landing_trust_multilingual_title")}</h4>
                        <p>සිංහල | தமிழ் | English</p>
                    </div>
                </div>

                <div className="trust-item">
                    <div className="icon-badge">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2 4 5v6c0 5 3.4 9 8 11 4.6-2 8-6 8-11V5l-8-3z" stroke="#4F32C4" strokeWidth="1.6" strokeLinejoin="round"/><path d="m9.5 12 1.8 1.8L15 10" stroke="#4F32C4" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <div>
                        <h4>{t("landing_trust_reliable_title")}</h4>
                        <p>{t("landing_trust_reliable_desc")}</p>
                    </div>
                </div>

                <div className="trust-item">
                    <div className="icon-badge">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="9" rx="2" stroke="#4F32C4" strokeWidth="1.6"/><path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="#4F32C4" strokeWidth="1.6" strokeLinecap="round"/></svg>
                    </div>
                    <div>
                        <h4>{t("landing_trust_privacy_title")}</h4>
                        <p>{t("landing_trust_privacy_desc")}</p>
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
                            {t("landing_about_title")} <span className="accent">LawBridge</span>
                        </h2>
                        <p className="about-lead">
                            {t("landing_about_lead")}
                        </p>

                        <p>
                            {t("landing_about_p1")}
                        </p>

                        <p>
                            {t("landing_about_p2")}
                        </p>
                    </div>

                    <div className="about-points">

                        <div className="point">
                            <div className="icon-badge">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#4F32C4" strokeWidth="1.6"/><path d="M12 8v4l3 2" stroke="#4F32C4" strokeWidth="1.6" strokeLinecap="round"/></svg>
                            </div>
                            <div>
                                <h4>{t("landing_about_point1_title")}</h4>
                                <p>{t("landing_about_point1_desc")}</p>
                            </div>
                        </div>

                        <div className="point">
                            <div className="icon-badge">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 3 3 7v4c0 5.2 3.6 9.4 9 10 5.4-.6 9-4.8 9-10V7l-9-4z" stroke="#4F32C4" strokeWidth="1.6" strokeLinejoin="round"/></svg>
                            </div>
                            <div>
                                <h4>{t("landing_about_point2_title")}</h4>
                                <p>{t("landing_about_point2_desc")}</p>
                            </div>
                        </div>

                        <div className="point">
                            <div className="icon-badge">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="#4F32C4" strokeWidth="1.6"/><path d="M12 3v3M12 18v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M3 12h3M18 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" stroke="#4F32C4" strokeWidth="1.6" strokeLinecap="round"/></svg>
                            </div>
                            <div>
                                <h4>{t("landing_about_point3_title")}</h4>
                                <p>{t("landing_about_point3_desc")}</p>
                            </div>
                        </div>

                        <div className="point">
                            <div className="icon-badge">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="9" rx="2" stroke="#4F32C4" strokeWidth="1.6"/><path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="#4F32C4" strokeWidth="1.6" strokeLinecap="round"/></svg>
                            </div>
                            <div>
                                <h4>{t("landing_about_point4_title")}</h4>
                                <p>{t("landing_about_point4_desc")}</p>
                            </div>
                        </div>

                    </div>

                </div>

            </section>


            {/* ---------- How It Works ---------- */}
            <section className="section how-section" id="how-it-works">

                <h2>
                    {t("landing_how_title_pre")} <span className="accent">LawBridge</span> {t("landing_how_title_suffix")}
                </h2>

                <div className="steps-row">

                    <div className="step-card">
                        <div className="step-number">1</div>
                        <div className="step-icon">
                            <img src={stepAskIcon} alt="" />
                        </div>
                        <h4>{t("landing_step1_title")}</h4>
                        <p>{t("landing_step1_desc")}</p>
                        <p className="step-example">{t("landing_step1_example")}</p>
                    </div>

                    <div className="step-arrow">&rarr;</div>

                    <div className="step-card">
                        <div className="step-number">2</div>
                        <div className="step-icon">
                            <img src={stepSearchIcon} alt="" />
                        </div>
                        <h4>{t("landing_step2_title")}</h4>
                        <p>{t("landing_step2_desc")}</p>
                    </div>

                    <div className="step-arrow">&rarr;</div>

                    <div className="step-card">
                        <div className="step-number">3</div>
                        <div className="step-icon">
                            <img src={stepAiIcon} alt="" />
                        </div>
                        <h4>{t("landing_step3_title")}</h4>
                        <p>{t("landing_step3_desc")}</p>
                    </div>

                    <div className="step-arrow">&rarr;</div>

                    <div className="step-card">
                        <div className="step-number">4</div>
                        <div className="step-icon">
                            <img src={stepChecklistIcon} alt="" />
                        </div>
                        <h4>{t("landing_step4_title")}</h4>
                        <p>{t("landing_step4_intro")}</p>
                        <ul className="step-list">
                            <li>{t("landing_step4_item1")}</li>
                            <li>{t("landing_step4_item2")}</li>
                            <li>{t("landing_step4_item3")}</li>
                            <li>{t("landing_step4_item4")}</li>
                            <li>{t("landing_step4_item5")}</li>
                        </ul>
                    </div>

                </div>

            </section>


            {/* ---------- Legal Topics ---------- */}
            <section className="section topics-section">

                <h2>{t("landing_topics_heading")}</h2>

                <div className="topics-grid">

                    <div className="topic-card">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="2.5" stroke="#4F32C4" strokeWidth="1.6"/><path d="M4 21c1.5-5 5-7 8-7s6.5 2 8 7" stroke="#4F32C4" strokeWidth="1.6" strokeLinecap="round"/><path d="M9 12h6" stroke="#4F32C4" strokeWidth="1.6" strokeLinecap="round"/></svg>
                        <span>{t("landing_topic_labour")}</span>
                    </div>

                    <div className="topic-card">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M4 11 12 4l8 7" stroke="#4F32C4" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 10v10h12V10" stroke="#4F32C4" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 20v-5h4v5" stroke="#4F32C4" strokeWidth="1.6"/></svg>
                        <span>{t("landing_topic_tenant")}</span>
                    </div>

                    <div className="topic-card">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="8" cy="7" r="2.4" stroke="#4F32C4" strokeWidth="1.6"/><circle cx="16" cy="7" r="2.4" stroke="#4F32C4" strokeWidth="1.6"/><path d="M2.5 20c.8-3.3 3-5 5.5-5s4.7 1.7 5.5 5M10.5 20c.8-3.3 3-5 5.5-5s4.7 1.7 5.5 5" stroke="#4F32C4" strokeWidth="1.6" strokeLinecap="round"/></svg>
                        <span>{t("landing_topic_family")}</span>
                    </div>

                    <div className="topic-card">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="7" cy="16" r="3" stroke="#4F32C4" strokeWidth="1.6"/><circle cx="17" cy="16" r="3" stroke="#4F32C4" strokeWidth="1.6"/><path d="M9 14l3-6 3 6M9 8h6" stroke="#4F32C4" strokeWidth="1.6" strokeLinecap="round"/></svg>
                        <span>{t("landing_topic_criminal")}</span>
                    </div>

                    <div className="topic-card">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M3 4h2l2.2 11a2 2 0 0 0 2 1.6h7a2 2 0 0 0 2-1.6L20 8H6" stroke="#4F32C4" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><circle cx="9.5" cy="20" r="1.4" stroke="#4F32C4" strokeWidth="1.4"/><circle cx="17" cy="20" r="1.4" stroke="#4F32C4" strokeWidth="1.4"/></svg>
                        <span>{t("landing_topic_consumer")}</span>
                    </div>

                    <div className="topic-card">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><rect x="4" y="8" width="16" height="11" rx="2" stroke="#4F32C4" strokeWidth="1.6"/><path d="M9 8V6a3 3 0 0 1 6 0v2" stroke="#4F32C4" strokeWidth="1.6" strokeLinecap="round"/></svg>
                        <span>{t("landing_topic_employment")}</span>
                    </div>

                    <div className="topic-card">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M4 16 6 9a2 2 0 0 1 2-1.4h8A2 2 0 0 1 18 9l2 7" stroke="#4F32C4" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><rect x="3" y="16" width="18" height="4" rx="1.5" stroke="#4F32C4" strokeWidth="1.6"/><circle cx="7.5" cy="20" r="1.2" stroke="#4F32C4" strokeWidth="1.4"/><circle cx="16.5" cy="20" r="1.2" stroke="#4F32C4" strokeWidth="1.4"/></svg>
                        <span>{t("landing_topic_traffic")}</span>
                    </div>

                    <div className="topic-card">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="8" cy="8" r="2.6" stroke="#4F32C4" strokeWidth="1.6"/><circle cx="16" cy="8" r="2.6" stroke="#4F32C4" strokeWidth="1.6"/><path d="M2.5 19.5c.7-3 2.8-4.5 5.5-4.5s4.8 1.5 5.5 4.5M10.5 19.5c.7-3 2.8-4.5 5.5-4.5s4.8 1.5 5.5 4.5" stroke="#4F32C4" strokeWidth="1.6" strokeLinecap="round"/></svg>
                        <span>{t("landing_topic_civil")}</span>
                    </div>

                </div>

            </section>


            {/* ---------- Why Choose ---------- */}
            <section className="why-section">

                <h2>
                    {t("landing_why_title_pre")} <span className="accent">LawBridge</span>?
                </h2>

                <div className="why-grid">

                    <div className="why-item">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" stroke="#F5A623" strokeWidth="1.6" strokeLinejoin="round"/></svg>
                        <div>
                            <h4>{t("landing_why_1_title")}</h4>
                            <p>{t("landing_why_1_desc")}</p>
                        </div>
                    </div>

                    <div className="why-item">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#4F32C4" strokeWidth="1.6"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z" stroke="#4F32C4" strokeWidth="1.6"/></svg>
                        <div>
                            <h4>{t("landing_why_2_title")}</h4>
                            <p>{t("landing_why_2_desc")}</p>
                        </div>
                    </div>

                    <div className="why-item">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 5v13a2 2 0 0 0 2 2h4V5H4z" stroke="#4F32C4" strokeWidth="1.6" strokeLinejoin="round"/><path d="M20 5v13a2 2 0 0 1-2 2h-4V5h6z" stroke="#4F32C4" strokeWidth="1.6" strokeLinejoin="round"/></svg>
                        <div>
                            <h4>{t("landing_why_3_title")}</h4>
                            <p>{t("landing_why_3_desc")}</p>
                        </div>
                    </div>

                    <div className="why-item">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2 4 5v6c0 5 3.4 9 8 11 4.6-2 8-6 8-11V5l-8-3z" stroke="#4F32C4" strokeWidth="1.6" strokeLinejoin="round"/><path d="m9.5 12 1.8 1.8L15 10" stroke="#4F32C4" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        <div>
                            <h4>{t("landing_why_4_title")}</h4>
                            <p>{t("landing_why_4_desc")}</p>
                        </div>
                    </div>

                    <div className="why-item">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="#4F32C4" strokeWidth="1.6"/><circle cx="12" cy="12" r="4" stroke="#4F32C4" strokeWidth="1.6"/><circle cx="12" cy="12" r="1" fill="#4F32C4"/></svg>
                        <div>
                            <h4>{t("landing_why_5_title")}</h4>
                            <p>{t("landing_why_5_desc")}</p>
                        </div>
                    </div>

                </div>

            </section>


            {/* ---------- Contact ---------- */}
            <section className="section contact-section" id="contact">

                <div className="contact-grid">

                    <div className="contact-info">
                        <h2 className="align-left">{t("landing_contact_heading")}</h2>
                        <p>{t("landing_contact_sub")}</p>

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
                            <input type="text" placeholder={t("landing_contact_name_placeholder")} />
                            <input type="email" placeholder={t("landing_contact_email_placeholder")} />
                        </div>
                        <input type="text" placeholder={t("landing_contact_subject_placeholder")} />
                        <textarea rows="4" placeholder={t("landing_contact_message_placeholder")} />
                        <button type="submit" className="btn btn-primary">{t("landing_contact_send")}</button>
                    </form>

                    <div
                        className="contact-visual"
                        style={{ backgroundImage: `url(${contactIllustration})` }}
                    />

                </div>

            </section>


            {/* ---------- FAQ ---------- */}
            <section className="section faq-section">

                <h2>{t("landing_faq_heading")}</h2>

                <div className="faq-grid">

                    <details className="faq-item">
                        <summary>{t("landing_faq_q1")}<span className="chevron">&#9662;</span></summary>
                        <p>{t("landing_faq_a1")}</p>
                    </details>

                    <details className="faq-item">
                        <summary>{t("landing_faq_q2")}<span className="chevron">&#9662;</span></summary>
                        <p>{t("landing_faq_a2")}</p>
                    </details>

                    <details className="faq-item">
                        <summary>{t("landing_faq_q3")}<span className="chevron">&#9662;</span></summary>
                        <p>{t("landing_faq_a3")}</p>
                    </details>

                    <details className="faq-item">
                        <summary>{t("landing_faq_q4")}<span className="chevron">&#9662;</span></summary>
                        <p>{t("landing_faq_a4")}</p>
                    </details>

                    <details className="faq-item">
                        <summary>{t("landing_faq_q5")}<span className="chevron">&#9662;</span></summary>
                        <p>{t("landing_faq_a5")}</p>
                    </details>

                    <details className="faq-item">
                        <summary>{t("landing_faq_q6")}<span className="chevron">&#9662;</span></summary>
                        <p>{t("landing_faq_a6")}</p>
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
                        <p>{t("landing_footer_tagline")}</p>
                        <div className="social-icons">
                            <a href="#" aria-label="Facebook"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 8h2V5h-2a4 4 0 0 0-4 4v2H9v3h2v7h3v-7h2.5l.5-3H14v-2a1 1 0 0 1 1-1z" stroke="white" strokeWidth="1.3" strokeLinejoin="round"/></svg></a>
                            <a href="#" aria-label="Twitter"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 4l16 16M20 4 4 20" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg></a>
                            <a href="#" aria-label="LinkedIn"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="3" stroke="white" strokeWidth="1.3"/><path d="M7 10v7M7 7v.01M11 17v-4.5a2 2 0 0 1 4 0V17M11 17h4" stroke="white" strokeWidth="1.3" strokeLinecap="round"/></svg></a>
                            <a href="#" aria-label="YouTube"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="18" height="12" rx="3" stroke="white" strokeWidth="1.3"/><path d="M11 9.5v5l4-2.5-4-2.5z" fill="white"/></svg></a>
                        </div>
                    </div>

                    <div className="footer-col">
                        <h5>{t("landing_footer_quick_links")}</h5>
                        <a>{t("landing_nav_home")}</a>
                        <a href="#about">{t("landing_nav_about")}</a>
                        <a href="#how-it-works">{t("landing_nav_how")}</a>
                        <a href="#features">{t("landing_nav_topics")}</a>
                        <a href="#contact">{t("landing_nav_contact")}</a>
                    </div>

                    <div className="footer-col">
                        <h5>{t("landing_footer_resources")}</h5>
                        <a>{t("landing_footer_privacy")}</a>
                        <a>{t("landing_footer_terms")}</a>
                    </div>

                    <div className="footer-col">
                        <h5>{t("landing_footer_contact")}</h5>
                        <span>support@lawbridge.lk</span>
                        <span>+94 71 XXX XXXX</span>
                        <span>Colombo, Sri Lanka</span>
                    </div>

                </div>

                <div className="footer-bottom">
                    {t("landing_footer_copyright")}
                </div>
            </footer>

        </div>

    );

}


export default Landing;
