import React from 'react'
import { Bell, MessageCircle, Search, Home, Bookmark, Users, Settings, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import './sidebar.css'

const LeftSideBar = () => {
  return (
    <>
         <nav className="left-sidebar">
          <div className="brand">
            <h2>Connect</h2>
          </div>
          
          <div className="nav-links">
          <Link to={'/'} className='nav-item'>
              <Users size={20} />
              <span>Home</span>
            </Link>
            <Link to={'/friends'} className='nav-item'>
              <Users size={20} />
              <span>Friends</span>
            </Link>
            <a href="#" className="nav-item">
              <MessageCircle size={20} />
              <span>Messages</span>
            </a>
            <a href="#" className="nav-item">
              <Bookmark size={20} />
              <span>Bookmarks</span>  
            </a>
            <a href="#" className="nav-item">
              <Settings size={20} />
              <span>Settings</span>
            </a>
          </div>
          <Link to="/addpost">
            <button className="create-post-btn">Create Post</button>
          </Link>
        </nav>
    </>
  )
}

export default LeftSideBar
