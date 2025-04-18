import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuthContext } from '../context/authContext';
import { useProfileContext } from '../context/profileContext';
import { Grid, Camera, Heart, MessageCircle, Settings, ChevronLeft } from 'lucide-react';
import useGetPost from '../hooks/useGetPost';
import useGetProfile from '../hooks/useGetProfile';
import Post from '../components/Post';
import toast from 'react-hot-toast';
import './profile.css'

const Profile = () => {
  const { authUser, loading } = useAuthContext();
  const { profileUser, setProfileUser } = useProfileContext();
  const { username } = useParams();
  const { fetchUserProfile } = useGetProfile(username);
  const { posts } = useGetPost(username);
  const navigate = useNavigate();
  
  const [followed, setFollowed] = useState(
    authUser?.followings?.some(id => id.toString() === profileUser?._id?.toString())
  );
  
  const [activeTab, setActiveTab] = useState('posts');

  const handleFollow = async (e) => {
    e.preventDefault();
    
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/followuser/${profileUser.username}`, {
        method: "POST",
        credentials: "include",
      });
      
      const data = await res.json();
      
      if(data.error) throw new Error(data.error);
      
      setFollowed((prev) => !prev);
    } catch(error) {
      console.log(error);
      toast.error(error.message);
    }
  };
  
  useEffect(() => {
    fetchUserProfile();
  }, [username]);

  if (loading || !profileUser) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <>
      <div className="container">
        <button className="back-button" onClick={() => navigate(-1)}>
          <ChevronLeft size={18} />
          Back
        </button>
        
        <div className="profile-card">
          {/* Profile Header with Photo and Info */}
          <div className="profile-header">
            <div className="profile-photo">
              <img src={profileUser.profilePicUrl || "https://via.placeholder.com/150"} alt={`${profileUser.username}'s profile`} />
            </div>
            
            <div className="profile-info-container">
              <div className="profile-info-header">
                <h2 className="username">{profileUser.username}</h2>
                
                <div className="action-buttons">
                  {authUser.username === profileUser.username ? (
                    <>
                      <Link to="/editprofile">
                        <button className="action-button secondary">Edit Profile</button>
                      </Link>
                      <Link to="/addpost">
                        <button className="action-button">Add Post</button>
                      </Link>
                    </>
                  ) : (
                    <button 
                      className={`action-button ${followed ? 'secondary' : ''}`} 
                      onClick={handleFollow}
                    >
                      {followed ? 'Following' : 'Follow'}
                    </button>
                  )}
                </div>
              </div>
              
              <div className="stats-section">
                <div className="stat-item">
                  <span className="stat-number">{profileUser.totalPosts || 0}</span> posts
                </div>
                <div className="stat-item">
                  <span className="stat-number">{profileUser.followers?.length || 0}</span> followers
                </div>
                <div className="stat-item">
                  <span className="stat-number">{profileUser.followings?.length || 0}</span> following
                </div>
              </div>
              
              <div className="bio-container">
          
                <p className="bio-text">{profileUser.bio || 'No bio yet'}</p>
              </div>
            </div>
          </div>
          
          {/* Profile Tabs */}
          <div className="profile-tabs">
            <div 
              className={`profile-tab ${activeTab === 'posts' ? 'active' : ''}`}
              onClick={() => setActiveTab('posts')}
            >
              <Grid size={16} />
              <span>Posts</span>
            </div>
            <div 
              className={`profile-tab ${activeTab === 'feed' ? 'active' : ''}`}
              onClick={() => setActiveTab('feed')}
            >
              <Camera size={16} />
              <span>Feed</span>
            </div>
          </div>
          
          {/* Tab Content */}
          {activeTab === 'posts' ? (
            <div className="posts-grid">
              {Array.isArray(posts) && posts.length > 0 ? (
                posts.map((post) => (
                  <div className="post-item" key={post._id} onClick={() => navigate(`/post/${post._id}`)}>
                    <img src={post.postImageUrl || "https://via.placeholder.com/300"} alt={post.description} />
                    <div className="post-overlay">
                      <div className="overlay-stat">
                        <Heart size={16} fill="white" />
                        <span>{post.postLikes?.length || 0}</span>
                      </div>
                      <div className="overlay-stat">
                        <MessageCircle size={16} fill="white" />
                        <span>{post.postComments?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-posts">
                  <Camera size={40} />
                  <h3>No Posts Yet</h3>
                  {authUser.username === profileUser.username && (
                    <Link to="/addpost">
                      <button className="action-button">Share Your First Photo</button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="posts-feed">
              {Array.isArray(posts) && posts.length > 0 ? (
                posts.map((post) => (
                  <Post 
                    key={post._id} 
                    post={post} 
                    username={username} 
                    profilePic={profileUser.profilePicUrl}
                  />
                ))
              ) : (
                <div className="no-posts">
                  <h3>No posts to show</h3>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;