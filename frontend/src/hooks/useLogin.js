import React from 'react'
import toast from 'react-hot-toast'
import { useAuthContext } from '../context/authContext.jsx'
import { useProfileContext } from '../context/profileContext.jsx';

const useLogin = () => {
  const {setAuthUser}=useAuthContext();
  const {setProfileUser}=useProfileContext()

  const backendUrl=import.meta.env.VITE_BACKEND_URL

  const login=async({username,password})=>{

    

    try{
      
        const res=await fetch(`${backendUrl}/api/auth/login`,{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({username,password}),
            credentials: "include",
        })
        console.log(res);
        const data=await res.json()
    
        if(data.error){
            throw new Error(data.error)
        }

        data.success="";
        
        localStorage.setItem('user',JSON.stringify(data))

        setAuthUser(data);
        setProfileUser(data);

    }catch(error){
        console.log(error)
        toast.error(error.message)
    }
   
    
  }
  return {login}
}

export default useLogin
