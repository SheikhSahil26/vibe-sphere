import React from 'react'
import toast from 'react-hot-toast';

const useAddPost = () => {
  
    const addPost=async({postImageUrl,postCaption})=>{ 
        try{
            console.log(postImageUrl,postCaption)
            const formData = new FormData();
            formData.append('postImageUrl', postImageUrl); // Add postPic
            formData.append('postCaption', postCaption);           // Add caption
            
            const res=await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/post/addpost`,{
                method:"POST",
                body:formData,
                credentials: "include",
            })

            const data=await res.json();

            console.log(data)

            if(data.error)throw new Error(data.error)

            toast.success(data.success) 



        }catch(error){
            console.log(error)
            toast.error(error.message);
        }
    }

    return {addPost};
}

export default useAddPost
