import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../../services/adminAuthService";
import loginBackground from "../../assets/login-background.png";
import logo from "../../assets/logo.png";
import "../auth/Login.css";


function AdminLogin()
{

    const navigate = useNavigate();


    const [formData, setFormData] = useState({

        email: "",
        password: ""

    });


    const [error, setError] = useState("");

    const [showPassword, setShowPassword] = useState(false);

    const [submitting, setSubmitting] = useState(false);



    const handleChange = (e) =>
    {
        setFormData({

            ...formData,

            [e.target.name]: e.target.value

        });
    };



    const handleSubmit = async (e) =>
    {
        e.preventDefault();

        setError("");

        setSubmitting(true);

        try
        {
            const response = await adminLogin(formData);

            localStorage.setItem("adminToken", response.token);

            navigate("/admin/dashboard");
        }
        catch (err)
        {
            setError(

                err.response?.data?.message ||
                "Admin login failed"

            );
        }
        finally
        {
            setSubmitting(false);
        }
    };



    return (

        <div
            className="auth-page"
            style={{ backgroundImage: `url(${loginBackground})` }}
        >

            {/* Navbar */}

            <header className="auth-navbar">

                <div className="brand">

                    <img src={logo} alt="LawBridge Logo" className="brand-logo" />

                    <span>LawBridge <span style={{ color: "var(--primary)" }}>Admin</span></span>

                </div>

            </header>


            {/* Login Card */}

            <div className="auth-center">

                <div className="auth-card">

                    <div className="auth-icon-circle">

                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M12 3.5 5 6v5.5c0 4.9 3 8.7 7 9.9 4-1.2 7-5 7-9.9V6l-7-2.5Z" stroke="#5428C7" strokeWidth="1.7" strokeLinejoin="round" />
                            <path d="M9.3 12.3l1.9 1.9 3.5-3.9" stroke="#5428C7" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>

                    </div>


                    <h1>Admin Sign In</h1>


                    <p className="auth-sub">
                        Restricted access. Sign in with your administrator
                        credentials to manage LawBridge.
                    </p>


                    {error &&

                        <div className="error-box">
                            {error}
                        </div>

                    }


                    <form className="auth-form" onSubmit={handleSubmit}>

                        <div className="field">

                            <label>Admin Email</label>

                            <div className="input-group">

                                <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="#9AA1B1" strokeWidth="1.6" />
                                    <path d="M4 6.5l8 6 8-6" stroke="#9AA1B1" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>

                                <input
                                    type="email"
                                    name="email"
                                    placeholder="admin@lawbridge.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                        </div>


                        <div className="field">

                            <label>Password</label>

                            <div className="input-group">

                                <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <rect x="4.5" y="10.5" width="15" height="10" rx="2.2" stroke="#9AA1B1" strokeWidth="1.6" />
                                    <path d="M7.5 10.5V7.7a4.5 4.5 0 0 1 9 0v2.8" stroke="#9AA1B1" strokeWidth="1.6" strokeLinecap="round" />
                                </svg>

                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />

                                <button
                                    type="button"
                                    className="toggle-visibility"
                                    onClick={() => setShowPassword(!showPassword)}
                                >

                                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                                        <path d="M2 12s3.8-7 10-7 10 7 10 7-3.8 7-10 7-10-7-10-7Z" stroke="#9AA1B1" strokeWidth="1.6" strokeLinejoin="round" />
                                        <circle cx="12" cy="12" r="3" stroke="#9AA1B1" strokeWidth="1.6" />
                                    </svg>

                                </button>

                            </div>

                        </div>


                        <button
                            className="btn-primary btn-block"
                            type="submit"
                            disabled={submitting}
                        >

                            {submitting ? "Signing in..." : "Sign In"}

                            {!submitting && <span className="btn-arrow">→</span>}

                        </button>

                    </form>

                </div>

            </div>


            {/* Footer */}

            <div className="auth-footer">

                <span>🛡 Trusted. Secure. Built for Sri Lanka.</span>

                <span>Admin access is logged and audited.</span>

                <span>🔒 We protect your data and respect your privacy.</span>

            </div>

        </div>

    );

}


export default AdminLogin;
