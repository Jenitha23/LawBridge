import axios from "axios";


const api = axios.create({

    baseURL:"https://lawbridge-backend-djghg8b9fna6f4a2.southeastasia-01.azurewebsites.net/api",

    headers:{
        "Content-Type":"application/json"
    }

});



api.interceptors.request.use(
(config)=>{

const token =
localStorage.getItem("token");


if(token)
{
    config.headers.Authorization =
    `Bearer ${token}`;
}


return config;

});


export default api;