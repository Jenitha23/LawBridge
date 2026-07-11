import { useState } from "react";
import { login } from "../../services/authService";
import { useNavigate } from "react-router-dom";


function Login()
{

    const navigate = useNavigate();


    const [formData, setFormData] = useState({

        email: "",
        password: ""

    });



    const [error,setError] = useState("");



    const handleChange = (e) =>
    {

        setFormData({

            ...formData,

            [e.target.name]: e.target.value

        });

    };



    const handleSubmit = async(e)=>
    {

        e.preventDefault();


        try
        {

            const response =
                await login(formData);



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

                "Login failed"

            );

        }

    };



    return (

        <div>


            <h1>
                Login to LawBridge
            </h1>



            {
                error &&
                <p>
                    {error}
                </p>
            }



            <form onSubmit={handleSubmit}>


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



                <button type="submit">

                    Login

                </button>



            </form>



            <p>

                Don't have an account?


                <button

                    onClick={() => navigate("/register")}

                >

                    Register

                </button>


            </p>



        </div>

    );

}


export default Login;