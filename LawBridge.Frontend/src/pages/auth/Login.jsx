import { useState } from "react";
import { login } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import loginBackground from "../../assets/login-background.png";
import logo from "../../assets/logo.png";
import "./Login.css";


function Login()
{

    const navigate = useNavigate();


    const [formData,setFormData] = useState({

        email:"",
        password:""

    });


    const [error,setError] = useState("");

    const [showPassword,setShowPassword] = useState(false);



    const handleChange = (e)=>{

        setFormData({

            ...formData,

            [e.target.name]:e.target.value

        });

    };



    const handleSubmit = async(e)=>{

        e.preventDefault();


        try{

            const response = await login(formData);


            localStorage.setItem(
                "token",
                response.token
            );


            navigate("/profile");


        }
        catch(error){

            setError(

                error.response?.data?.message ||
                "Login failed"

            );

        }

    };




    return(

        <div
        className="auth-page"
        style={{
            backgroundImage:`url(${loginBackground})`
        }}
        >



            {/* Navbar */}

            <header className="auth-navbar">


                <div className="brand">


                    <img
                    src={logo}
                    alt="LawBridge Logo"
                    className="brand-logo"
                    />


                    <span>
                        LawBridge
                    </span>


                </div>


            </header>






            {/* Login Card */}


            <div className="auth-center">


                <div className="auth-card">


                    <div className="auth-icon-circle">


                        <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        >

                            <circle
                            cx="12"
                            cy="8"
                            r="4"
                            stroke="#5428C7"
                            strokeWidth="1.7"
                            />


                            <path
                            d="M4 20c0-4 3.6-6 8-6s8 2 8 6"
                            stroke="#5428C7"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            />

                        </svg>


                    </div>





                    <h1>
                        Welcome Back!
                    </h1>




                    <p className="auth-sub">

                        Sign in to continue your journey with AI-powered
                        legal guidance in Sinhala, Tamil, and English.

                    </p>




                    {
                        error &&

                        <div className="error-box">

                            {error}

                        </div>

                    }





                    <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                    >




                        <div className="field">


                            <label>
                                Email Address
                            </label>


                            <div className="input-group">


                                <svg
                                className="input-icon"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                >
                                    <rect
                                    x="3"
                                    y="5"
                                    width="18"
                                    height="14"
                                    rx="2.5"
                                    stroke="#9AA1B1"
                                    strokeWidth="1.6"
                                    />

                                    <path
                                    d="M4 6.5l8 6 8-6"
                                    stroke="#9AA1B1"
                                    strokeWidth="1.6"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    />
                                </svg>


                                <input

                                type="email"

                                name="email"

                                placeholder="you@example.com"

                                value={formData.email}

                                onChange={handleChange}

                                />


                            </div>


                        </div>






                        <div className="field">


                            <label>
                                Password
                            </label>



                            <div className="input-group">


                                <svg
                                className="input-icon"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                >
                                    <rect
                                    x="4.5"
                                    y="10.5"
                                    width="15"
                                    height="10"
                                    rx="2.2"
                                    stroke="#9AA1B1"
                                    strokeWidth="1.6"
                                    />

                                    <path
                                    d="M7.5 10.5V7.7a4.5 4.5 0 0 1 9 0v2.8"
                                    stroke="#9AA1B1"
                                    strokeWidth="1.6"
                                    strokeLinecap="round"
                                    />
                                </svg>


                                <input

                                type={
                                    showPassword
                                    ?
                                    "text"
                                    :
                                    "password"
                                }

                                name="password"

                                placeholder="Enter your password"

                                value={formData.password}

                                onChange={handleChange}

                                />



                                <button

                                type="button"

                                className="toggle-visibility"

                                onClick={()=>
                                    setShowPassword(
                                        !showPassword
                                    )
                                }

                                >

                                    <svg
                                    width="19"
                                    height="19"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    >
                                        <path
                                        d="M2 12s3.8-7 10-7 10 7 10 7-3.8 7-10 7-10-7-10-7Z"
                                        stroke="#9AA1B1"
                                        strokeWidth="1.6"
                                        strokeLinejoin="round"
                                        />

                                        <circle
                                        cx="12"
                                        cy="12"
                                        r="3"
                                        stroke="#9AA1B1"
                                        strokeWidth="1.6"
                                        />
                                    </svg>

                                </button>



                            </div>


                        </div>






                        <div className="field-row-end">


                            <button
                            type="button"
                            className="link-muted"
                            >

                                Forgot Password?

                            </button>


                        </div>






                        <button
                        className="btn-primary btn-block"
                        type="submit"
                        >

                            Sign In
                            <span className="btn-arrow">→</span>

                        </button>


                        <div className="divider">

                            <span>or</span>

                        </div>


                        <button
                        type="button"
                        className="btn-google btn-block"
                        >

                            <svg
                            width="20"
                            height="20"
                            viewBox="0 0 48 48"
                            >
                                <path
                                fill="#FFC107"
                                d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5Z"
                                />

                                <path
                                fill="#FF3D00"
                                d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.6 8.3 6.3 14.7Z"
                                />

                                <path
                                fill="#4CAF50"
                                d="M24 44c5.4 0 10.3-2.1 14-5.5l-6.5-5.3c-2 1.4-4.6 2.3-7.5 2.3-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44Z"
                                />

                                <path
                                fill="#1976D2"
                                d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.5 5.3C41.4 35.5 44 30.2 44 24c0-1.3-.1-2.7-.4-3.5Z"
                                />
                            </svg>

                            Continue with Google

                        </button>




                    </form>






                    <p className="auth-switch">


                        Don't have an account?


                        <button

                        className="btn-link"

                        onClick={()=>
                            navigate("/register")
                        }

                        >

                            Sign Up

                        </button>


                    </p>




                </div>


            </div>






            {/* Footer */}

            <div className="auth-footer">


                <span>
                    🛡 Trusted. Secure. Built for Sri Lanka.
                </span>


                <span>
                    Your rights. Your voice. Our support.
                </span>


                <span>
                    🔒 We protect your data and respect your privacy.
                </span>


            </div>




        </div>


    );

}



export default Login;