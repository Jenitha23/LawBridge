import {
BrowserRouter,
Routes,
Route
}
from "react-router-dom";


import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/user/Dashboard";
import ChatHistory from "./pages/user/ChatHistory";
import Profile from "./pages/user/Profile";
import ComingSoon from "./pages/user/ComingSoon";
import Landing from "./pages/Landing";
import ProtectedRoute from "./components/ProtectedRoute";

import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProfile from "./pages/admin/Profile";
import AdminUploadDocument from "./pages/admin/UploadDocument";
import AdminCategories from "./pages/admin/Categories";
import AdminUsers from "./pages/admin/Users";
import AdminProtectedRoute from "./components/AdminProtectedRoute";


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


{/* ---------- Admin routes ---------- */}

<Route
path="/admin/login"
element={<AdminLogin/>}
/>


<Route
path="/admin/dashboard"
element={
<AdminProtectedRoute>
<AdminDashboard/>
</AdminProtectedRoute>
}
/>


<Route
path="/admin/profile"
element={
<AdminProtectedRoute>
<AdminProfile/>
</AdminProtectedRoute>
}
/>


<Route
path="/admin/documents/upload"
element={
<AdminProtectedRoute>
<AdminUploadDocument/>
</AdminProtectedRoute>
}
/>


<Route
path="/admin/categories"
element={
<AdminProtectedRoute>
<AdminCategories/>
</AdminProtectedRoute>
}
/>


<Route
path="/admin/users"
element={
<AdminProtectedRoute>
<AdminUsers/>
</AdminProtectedRoute>
}
/>


{/* Sidebar links not wired to the backend yet */}

<Route
path="/chats"
element={
<ProtectedRoute>
<ChatHistory/>
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
