import {
createContext,
useState
}
from "react";


export const AuthContext =
createContext();



export function AuthProvider({children})
{

const [token,setToken]=useState(
localStorage.getItem("token")
);



const saveToken=(token)=>{

localStorage.setItem(
"token",
token
);

setToken(token);

};



const logout=()=>{

localStorage.removeItem(
"token"
);

setToken(null);

};



return (

<AuthContext.Provider
value={{
token,
saveToken,
logout
}}
>

{children}

</AuthContext.Provider>

);


}