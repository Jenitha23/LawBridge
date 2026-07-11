import { useNavigate } from "react-router-dom";


function Landing()
{

    const navigate = useNavigate();


    return (

        <div>


            <header>

                <h1>
                    LawBridge
                </h1>


                <p>
                    AI-Powered Multilingual Legal Guidance Platform
                </p>


            </header>



            <section>


                <h2>
                    Understand Your Legal Rights Easily
                </h2>


                <p>
                    LawBridge helps Sri Lankan citizens understand
                    legal information in Sinhala, Tamil, and English.
                    Get simple explanations, document guidance,
                    and the correct first step for common legal issues.
                </p>


            </section>



            <section>


                <h3>
                    Our Features
                </h3>


                <ul>

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



            <button
                onClick={() => navigate("/register")}
            >

                Get Started

            </button>


            <button
                onClick={() => navigate("/login")}
            >

                Login

            </button>



        </div>

    );

}


export default Landing;