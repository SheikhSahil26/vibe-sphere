import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAddComment from '../hooks/useAddComment';
import './comment.css'; // Make sure to create this CSS file

const Comment = (props) => {
  const [allComments, setAllComments] = useState([]);
  const [comments, setComments] = useState([]);
  const [inputs, setInputs] = useState({
    commentBody: "",
    postId: props.forPost,
  });
  const [isLiked, setIsLiked] = useState({});

  const { addComment } = useAddComment();

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`/api/post/getpostcomments/${props.forPost}`, {
          method: "GET",
        });
        const data = await res.json();

        setAllComments(data.comments); // all comments of the post
        setComments(data.comments.slice(0, 3)); // comments shown in homepage
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };
    
    fetchComments();
  }, [props.forPost]); // Changed dependency to prevent infinite loop

  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!inputs.commentBody.trim()) return;
    
    await addComment(inputs);
    setInputs({ ...inputs, commentBody: "" });
    
    // Refresh comments
    const res = await fetch(`/api/post/getpostcomments/${props.forPost}`, {
      method: "GET",
    });
    const data = await res.json();
    setAllComments(data.comments);
    setComments(data.comments.slice(0, 3));
  };

  const handleLikeComment = (commentId) => {
    setIsLiked(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
    // Here you would normally call your API to like/unlike the comment
  };

  return (
    <div className="instagram-comments-container">
      {/* Comments List */}
      <div className="comments-list">
        {comments && comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment._id} className="comment-item">
              <div className="comment-content">
                <Link to={`/profile/${comment.username || 'user'}`} className="comment-username">
                  {comment.username || 'user'}
                </Link>
                <span className="comment-text">{comment.commentBody}</span>
              </div>
              <div className="comment-actions">
                <span className="comment-time">{new Date(comment.createdAt).toLocaleDateString()}</span>
                <button 
                  className={`comment-like-btn ${isLiked[comment._id] ? 'liked' : ''}`}
                  onClick={() => handleLikeComment(comment._id)}
                >
                  <Heart size={12} className={isLiked[comment._id] ? 'text-red-500 fill-red-500' : ''} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-comments">No comments yet</div>
        )}
        
        {allComments.length > 3 && (
          <Link 
            to={`/seecomments/${props.forPost}?comments=${encodeURIComponent(JSON.stringify(allComments))}`}
            className="view-all-comments"
          >
            View all {allComments.length} comments
          </Link>
        )}
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleAddComment} className="comment-form">
        <input
          type="text"
          value={inputs.commentBody}
          onChange={(e) => setInputs({...inputs, commentBody: e.target.value})}
          placeholder="Add a comment..."
          className="comment-input"
        />
        <button
          type="submit"
          disabled={!inputs.commentBody.trim()}
          className="comment-submit-btn"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};

export default Comment;