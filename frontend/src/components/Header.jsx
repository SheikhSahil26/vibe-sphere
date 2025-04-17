import React from 'react'
import { useAuthContext } from '../context/authContext'
import { Bell, MessageCircle, Search, Home, Bookmark, Users, Settings, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
const Header = () => {

    const {authUser}=useAuthContext();



  return (
    <>
    
    <header className="main-header">
            <div className="search-container">
              <Search size={20} />
              <input type="text" placeholder="Search..." />
            </div>
            <div className="header-actions">
              <button className="icon-btn">
                <Bell size={20} />
                <span className="notification-badge">0</span>
              </button>
              <div className="user-menu">
                <Link to={`/profile/${authUser.username}`} style={{ textDecoration: 'none' }}>
                  <img src={authUser.profilePicUrl} alt="" className="avatar" />
                  <span>{authUser.username}</span>
                </Link>
              </div>
            </div>
          </header>
    
    
    </>
  )
}

export default Header
