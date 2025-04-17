import React, { useState } from 'react';
import { useAuthContext } from '../context/authContext';
import { MoreHorizontal, MessageCircle, Heart, Repeat, Share2 } from 'lucide-react';
import LikeDislike from './LikeDislike';
import { extractTime } from '../utils/extractTime';
import { Link } from 'react-router-dom';
import Comment from './Comment';
import './post.css'; // Make sure to create this CSS file or include these styles in your existing CSS

const Post = (props) => {
  const { authUser } = useAuthContext();
  const [isSetComment, setComment] = useState(false);

  const handleCommentClick = () => {
    setComment((prev) => !prev);
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-author">
          <img src={props.profilePic} alt="User avatar" className="avatar" />
          <div>
            <Link to={`/profile/${props.username}`} className="author-name">
              {props.username}
            </Link>
            <span className="post-time">{extractTime(props.post.createdAt)}</span>
          </div>
        </div>
        <button className="more-btn">
          <MoreHorizontal size={20} />
        </button>
      </div>

      <div className="post-image-container">
        <img src={props.post.postImageUrl} alt="Post" className="post-image" />
      </div>

      <div className="post-actions">
        <div className="left-actions">
          <LikeDislike postId={props.post._id} post={props.post} />
          <button className="action-btn" onClick={handleCommentClick}>
            <MessageCircle size={24} />
          </button>
          <button className="action-btn">
            <Share2 size={24} />
          </button>
        </div>
      </div>

      {props.post.postCaption && (
        <div className="post-caption">
          <Link to={`/profile/${props.username}`} className="caption-username">
            {props.username}
          </Link>
          <span className="caption-text">{props.post.postCaption}</span>
        </div>
      )}

      {/* Comment count display */}
      <div className="comment-count" onClick={handleCommentClick}>
        {props.post.postComments.length > 0 ? (
          <span>View all {props.post.postComments.length} comments</span>
        ) : (
          <span>No comments yet</span>
        )}
      </div>

      {/* Conditionally render comments section */}
      {isSetComment && <Comment forPost={props.post._id} />}
    </div>
  );
};

export default Post;