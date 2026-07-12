import {
BrowserRouter,
Routes,
Route
}
from "react-router-dom";


import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/user/Dashboard";
import Profile from "./pages/user/Profile";
import ComingSoon from "./pages/user/ComingSoon";
import Landing from "./pages/Landing";
import ProtectedRoute from "./components/ProtectedRoute";


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
path="/dashboard"
element={
<ProtectedRoute>
<Dashboard/>
</ProtectedRoute>
}
/>


<Route
path="/profile"
element={
<ProtectedRoute>
<Profile/>
</ProtectedRoute>
}
/>


{/* Sidebar links not wired to the backend yet */}

<Route
path="/chats"
element={
<ProtectedRoute>
<ComingSoon title="My Chats"/>
</ProtectedRoute>
}
/>

<Route
path="/documents"
element={
<ProtectedRoute>
<ComingSoon title="My Documents"/>
</ProtectedRoute>
}
/>

<Route
path="/topics"
element={
<ProtectedRoute>
<ComingSoon title="Legal Topics"/>
</ProtectedRoute>
}
/>

<Route
path="/saved"
element={
<ProtectedRoute>
<ComingSoon title="Saved Answers"/>
</ProtectedRoute>
}
/>

<Route
path="/settings"
element={
<ProtectedRoute>
<ComingSoon title="Settings"/>
</ProtectedRoute>
}
/>


</Routes>

</BrowserRouter>

);

}


export default App;
