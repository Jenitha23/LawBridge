import { logout } from "../services/authService";


function Navbar()
{


    const handleLogout = () =>
    {

        logout();

        window.location.href="/login";

    };


    return (

        <nav>

            <h2>
                LawBridge
            </h2>


            <div>

                <a href="/profile">
                    Profile
                </a>


                <button onClick={handleLogout}>
                    Logout
                </button>

            </div>


        </nav>

    );


}


export default Navbar;