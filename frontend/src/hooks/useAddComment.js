import React from 'react'

const useAddComment = () => {

  let response

  const addComment=async ({commentBody,postId})=>{
    const res=await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/post/comment/${postId}`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({commentBody}),
        credentials: "include",
    })
    console.log(res)
    const data=await res.json();

    console.log(data);

  }

  return {addComment};
}

export default useAddComment
