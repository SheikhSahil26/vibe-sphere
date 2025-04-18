import React,{useState,useEffect} from 'react'
import { Bell, MessageCircle, Search, Home, Bookmark, Users, Settings, TrendingUp } from 'lucide-react';
import { useAuthContext } from '../context/authContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const RightSideBar = () => {

      const { authUser } = useAuthContext()  // getting the context of the authUser means the loggedIn user!!!
    
      const [users, setUsers] = useState([]);



    useEffect(() => {
        const getAllUsers = async () => {
          try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/getusers`, {
              method: "GET",
              credentials: "include",
            })
            const data = await res.json();
    
            setUsers(data.users || [])
      
            if (data.error) throw new Error(data.error);
          }
          catch (error) {
            console.log(error)
            toast.error(error.message)
          }
        }
        getAllUsers();
      }, [])



  return (
   <>
   <aside className="right-sidebar">
          <div className="trending-section">
            <div className="section-header">
              <h3>Trending</h3>
              <TrendingUp size={20} />
            </div>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="trending-item">
                <span className="trending-tag">#Trending{i}</span>
                <span className="trending-count">{i}0K posts</span>
              </div>
            ))}
          </div>

          <div className="suggestions-section">
            <div className="section-header">
              <h3>Suggested for you</h3>
            </div>
            {Array.isArray(users) && users.length > 0 ? (
              users.map(user => (
                <div key={user.username} className="suggestion-item">
                  <img src={user.profilePicUrl} alt="Suggested user" className="avatar" />
                  <div className="suggestion-info">
                    <Link style={{ textDecoration: 'none' }} to={`/profile/${user.username}`}>
                      <h4>{user.username}</h4>
                    </Link>
                    <span>Followed by User X</span>
                  </div>
                  <button className="follow-btn">Follow</button>
                </div>
              ))
            ) : (
              <h3>No users to show</h3>
            )}
          </div>
        </aside>
   </>
  )
}

export default RightSideBar
