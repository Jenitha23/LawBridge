import {
useEffect,
useState
}
from "react";


import api from "../../api/axios";

import Navbar from "../../components/Navbar";


function Profile()
{

const [data,setData]=useState(null);



useEffect(()=>{


api.get("/users/profile")
.then(response=>{

setData(response.data);

});


},[]);



return (

<div>

<Navbar/>


<h1>
User Profile
</h1>


{
data &&
<pre>

{
JSON.stringify(
data,
null,
2
)

}

</pre>
}


</div>

);


}


export default Profile;