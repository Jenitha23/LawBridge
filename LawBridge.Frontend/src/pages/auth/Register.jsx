import { useState } from "react";
import { register } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import registerBackground from "../../assets/login-background.png";
import logo from "../../assets/logo.png";
import "./Register.css";


function Register()
{

    const navigate = useNavigate();


    const [formData,setFormData] = useState({

        name:"",
        email:"",
        password:"",
        preferredLanguage:"English"

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


            const response = await register(formData);



            localStorage.setItem(
                "token",
                response.token
            );


            navigate("/profile");


        }
        catch(error){


            setError(

                error.response?.data?.message ||
                "Registration failed"

            );


        }


    };







    return(


        <div
        className="auth-page"
        style={{
            backgroundImage:
            `url(${registerBackground})`
        }}
        >





            {/* Navbar */}

            <header className="auth-navbar">


                <div className="brand">


                    <img

                    src={logo}

                    alt="LawBridge"

                    className="brand-logo"

                    />


                    <span>
                        LawBridge
                    </span>


                </div>


            </header>







            {/* Register Card */}


            <div className="auth-center">


                <div className="auth-card">





                    <div className="auth-icon-circle">


                        <svg
                        width="30"
                        height="30"
                        viewBox="0 0 24 24"
                        fill="none"
                        >

                            <circle
                            cx="10"
                            cy="8"
                            r="4"
                            stroke="#4F32C4"
                            strokeWidth="1.7"
                            />


                            <path
                            d="M2 20c0-4 3.6-6 8-6s8 2 8 6"
                            stroke="#4F32C4"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            />


                            <path
                            d="M19 8v6M16 11h6"
                            stroke="#4F32C4"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            />


                        </svg>


                    </div>






                    <h1>
                        Create Your Account
                    </h1>





                    <p className="auth-sub">

                        Join LawBridge and get AI-powered legal guidance
                        in Sinhala, Tamil, and English.

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





                        {/* Name */}


                        <div className="field">


                            <label>
                                Full Name
                            </label>


                            <div className="input-group">


                                <input

                                type="text"

                                name="name"

                                placeholder="Enter your full name"

                                value={formData.name}

                                onChange={handleChange}

                                />


                            </div>


                        </div>







                        {/* Email */}


                        <div className="field">


                            <label>
                                Email Address
                            </label>



                            <div className="input-group">


                                <input

                                type="email"

                                name="email"

                                placeholder="Enter your email address"

                                value={formData.email}

                                onChange={handleChange}

                                />


                            </div>


                        </div>







                        {/* Password */}


                        <div className="field">


                            <label>
                                Password
                            </label>



                            <div className="input-group">


                                <input

                                type={
                                    showPassword
                                    ?
                                    "text"
                                    :
                                    "password"
                                }

                                name="password"

                                placeholder="Create a password"

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

                                    👁

                                </button>


                            </div>


                        </div>







                        {/* Language */}


                        <div className="field">


                            <label>
                                Preferred Language
                            </label>



                            <div className="input-group">


                                <select

                                name="preferredLanguage"

                                value={
                                    formData.preferredLanguage
                                }

                                onChange={handleChange}

                                >


                                    <option value="English">
                                        English
                                    </option>


                                    <option value="Sinhala">
                                        Sinhala
                                    </option>


                                    <option value="Tamil">
                                        Tamil
                                    </option>


                                </select>


                            </div>


                        </div>






                        <button
                        className="btn-primary btn-block"
                        type="submit"
                        >

                            Sign Up

                        </button>




                    </form>







                    <p className="auth-switch">


                        Already have an account?


                        <button

                        className="btn-link"

                        onClick={()=>
                            navigate("/login")
                        }

                        >

                            Sign In

                        </button>


                    </p>






                    <p className="terms-note">

                        🔒 We respect your privacy and keep your data secure.

                    </p>




                </div>



            </div>




        </div>


    );


}



export default Register;