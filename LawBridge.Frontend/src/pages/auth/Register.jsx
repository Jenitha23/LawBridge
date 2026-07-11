import { useState } from "react";
import { register } from "../../services/authService";
import { useNavigate } from "react-router-dom";


function Register()
{

    const navigate = useNavigate();


    const [formData, setFormData] = useState({

        name: "",
        email: "",
        password: "",
        preferredLanguage: "English"

    });


    const [error, setError] = useState("");



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


        try
        {

            const response =
                await register(formData);


            // Store JWT token
            localStorage.setItem(
                "token",
                response.token
            );


            navigate("/profile");


        }
        catch(error)
        {

            setError(
                error.response?.data?.message ||
                "Registration failed"
            );

        }

    };



    return (

        <div>


            <h1>
                Create LawBridge Account
            </h1>


            {
                error &&
                <p>
                    {error}
                </p>
            }



            <form onSubmit={handleSubmit}>


                <input

                    type="text"

                    name="name"

                    placeholder="Full Name"

                    value={formData.name}

                    onChange={handleChange}

                />



                <input

                    type="email"

                    name="email"

                    placeholder="Email"

                    value={formData.email}

                    onChange={handleChange}

                />



                <input

                    type="password"

                    name="password"

                    placeholder="Password"

                    value={formData.password}

                    onChange={handleChange}

                />



                <select

                    name="preferredLanguage"

                    value={formData.preferredLanguage}

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



                <button type="submit">

                    Register

                </button>



            </form>



            <p>

                Already have an account?

                <button
                    onClick={() => navigate("/login")}
                >
                    Login
                </button>

            </p>


        </div>

    );

}


export default Register;