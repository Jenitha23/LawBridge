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
import MyDocuments from "./pages/user/MyDocuments";
import LegalTopics from "./pages/user/LegalTopics";
import SavedAnswers from "./pages/user/SavedAnswers";
import Profile from "./pages/user/Profile";
import Settings from "./pages/user/Settings";
import Landing from "./pages/Landing";
import ProtectedRoute from "./components/ProtectedRoute";

import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProfile from "./pages/admin/Profile";
import AdminUploadDocument from "./pages/admin/UploadDocument";
import AdminLegalDocuments from "./pages/admin/LegalDocuments";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminChatLogs from "./pages/admin/ChatLogs";
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
path="/admin/documents"
element={
<AdminProtectedRoute>
<AdminLegalDocuments/>
</AdminProtectedRoute>
}
/>


<Route
path="/admin/analytics"
element={
<AdminProtectedRoute>
<AdminAnalytics/>
</AdminProtectedRoute>
}
/>


<Route
path="/admin/chat-logs"
element={
<AdminProtectedRoute>
<AdminChatLogs/>
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
<MyDocuments/>
</ProtectedRoute>
}
/>

<Route
path="/topics"
element={
<ProtectedRoute>
<LegalTopics/>
</ProtectedRoute>
}
/>

<Route
path="/saved"
element={
<ProtectedRoute>
<SavedAnswers/>
</ProtectedRoute>
}
/>

<Route
path="/settings"
element={
<ProtectedRoute>
<Settings/>
</ProtectedRoute>
}
/>


</Routes>

</BrowserRouter>

);

}


export default App;
