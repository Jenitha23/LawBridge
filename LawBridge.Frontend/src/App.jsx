import {
BrowserRouter,
Routes,
Route
}
from "react-router-dom";


import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Profile from "./pages/user/Profile";
import Landing from "./pages/Landing";


function App()
{

return (

<BrowserRouter>

<Routes>
  
<Route
path="/"
element={<Landing/>}
/>

<Route
path="/register"
element={<Register/>}
/>


<Route
path="/login"
element={<Login/>}
/>


<Route
path="/profile"
element={<Profile/>}
/>


</Routes>

</BrowserRouter>

);

}


export default App;