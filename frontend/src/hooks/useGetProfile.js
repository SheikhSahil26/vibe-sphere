import React, { useEffect } from 'react'
import { useAuthContext } from '../context/authContext'
import toast from 'react-hot-toast';
import { useProfileContext } from '../context/profileContext';

const useGetProfile = (username) => {
  
    const {authUser,setAuthUser,loading,setLoading} = useAuthContext();
    const {profileUser,setProfileUser}=useProfileContext();

        const fetchUserProfile=async()=>{
            try{

                console.log(username)

                setLoading(true)
                const res=await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/profile/${username}`,{
                    method:"GET",
                })

                if(!res.ok) throw new Error('failed to fetch data')

                if(res.ok){
                    const data= await res.json();

                    if(data.error) throw new Error(data.error);

                    console.log(data)

                    
                    setProfileUser(data);
                    

                }
            }
            catch(error){
                console.log(error)
                toast.error(error.message);
            }finally{
                setLoading(false)
               
            }
        }

   return {fetchUserProfile};
    
}

export default useGetProfile
