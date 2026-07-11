import api from "../api/axios";


export const register = async(user)=>{

const response =
await api.post(
"/auth/register",
user
);

return response.data;

};



export const login = async(user)=>{

const response =
await api.post(
"/auth/login",
user
);

return response.data;

};



export const logout=()=>{

localStorage.removeItem("token");

};