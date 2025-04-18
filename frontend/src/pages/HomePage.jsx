import React, { useState, useEffect } from 'react'
import './home.css'
import { Link } from 'react-router-dom';
import LogOut from '../components/LogOut'
import { Bell, MessageCircle, Search, Home, Bookmark, Users, Settings, TrendingUp } from 'lucide-react';
import { useAuthContext } from '../context/authContext';
import toast from 'react-hot-toast';
import Post from '../components/Post';
import Stories from '../components/Stories';
import Header from '../components/Header';
import LeftSideBar from '../components/LeftSideBar';
import RightSideBar from '../components/RightSideBar';

const HomePage = () => {
  const { authUser } = useAuthContext()  // getting the context of the authUser means the loggedIn user!!!

  const [posts, setPosts] = useState([])
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const getAllPosts = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/post/getallposts`, {
          method: "GET",
        })

        const data = await res.json()

        if (data.error) throw new Error(data.error)

        setPosts(data.posts || []);
      } catch (error) {
        console.log(error)
        toast.error(error.message)
      }
    }

    getAllPosts()
  }, [])

  

  return (
    <>
      <div className="social-container"> 

        <LeftSideBar/>

        {/* Main Content */}
        <main className="main-content">
         
          <Header/>

          <div className="content-wrapper">
            {/* Stories component */}
            <Stories />

            <div className="feed">
              <div className="post-composer">
                <img src={authUser.profilePicUrl || "/api/placeholder/40/40"} alt="Your avatar" className="avatar" />
                <input type="text" placeholder="What's on your mind?" />
                <button className="post-btn">Post</button>
              </div>

              {Array.isArray(posts) && posts.length > 0 ? (
                posts.map((post) => (
                  <Post 
                    key={post._id} 
                    post={post} 
                    username={post.postedBy.username} 
                    profilePic={post.postedBy.profilePicUrl}
                  />
                ))
              ) : (
                <h1>No posts to show</h1>
              )}
            </div>
          </div>
        </main>

        {/* Right Sidebar */}


        <RightSideBar/>

        
      </div>
      <LogOut />
    </>
  )
}

export default HomePage