import axios from "axios";


// Same backend host as api/axios.js. Kept as a separate instance (rather
// than reusing api/axios.js) because it reads a different localStorage key
// ("adminToken" instead of "token"), so an admin session and a regular user
// session can co-exist in the same browser without overwriting each other.
const adminApi = axios.create({

    baseURL:"http://localhost:5176/api",

    headers:{
        "Content-Type":"application/json"
    }

});



adminApi.interceptors.request.use(
(config)=>{

const token =
localStorage.getItem("adminToken");


if(token)
{
    config.headers.Authorization =
    `Bearer ${token}`;
}


return config;

});


export default adminApi;
