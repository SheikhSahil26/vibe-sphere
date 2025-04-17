import React, { useState, useEffect } from 'react';
import './friends.css';
import { Link } from 'react-router-dom';
import { X, Send } from 'lucide-react';
import { useAuthContext } from '../context/authContext';
import toast from 'react-hot-toast';
import LogOut from '../components/LogOut';
import Header from '../components/Header';
import LeftSideBar from '../components/LeftSideBar';
import RightSideBar from '../components/RightSideBar';

// Chat component to be displayed when messaging
const ChatBox = ({ friend, onClose }) => {
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch chat history when the chat box opens
        const fetchChatHistory = async () => {
            setLoading(true);
            try {
                // This would be replaced with actual API call to get chat history
                // const res = await fetch(`/api/messages/${friend.username}`);
                // const data = await res.json();
                // setChatHistory(data.messages);
                
                // For demo purposes, we're using mock data
                setTimeout(() => {
                    setChatHistory([
                        { id: 1, sender: friend.username, text: "Hey there!", timestamp: new Date(Date.now() - 3600000).toLocaleTimeString() },
                        { id: 2, sender: 'me', text: "Hi! How are you?", timestamp: new Date(Date.now() - 3500000).toLocaleTimeString() },
                        { id: 3, sender: friend.username, text: "I'm good, thanks! What about you?", timestamp: new Date(Date.now() - 3400000).toLocaleTimeString() }
                    ]);
                    setLoading(false);
                }, 800);
            } catch (error) {
                console.error('Error fetching chat history:', error);
                toast.error('Failed to load chat history');
                setLoading(false);
            }
        };

        fetchChatHistory();
    }, [friend.username]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        // Add message to chat history
        const newMessage = {
            id: chatHistory.length + 1,
            sender: 'me',
            text: message,
            timestamp: new Date().toLocaleTimeString()
        };
        
        setChatHistory([...chatHistory, newMessage]);
        
        // Here you would also send the message to your API
        // const sendMessage = async () => {
        //     try {
        //         await fetch('/api/messages/send', {
        //             method: 'POST',
        //             headers: { 'Content-Type': 'application/json' },
        //             body: JSON.stringify({ 
        //                 recipientUsername: friend.username,
        //                 message: message
        //             })
        //         });
        //     } catch (error) {
        //         console.error('Error sending message:', error);
        //         toast.error('Failed to send message');
        //     }
        // };
        // sendMessage();
        
        setMessage('');
        
        // Simulate friend reply for demo purposes
        setTimeout(() => {
            const replyMessage = {
                id: chatHistory.length + 2,
                sender: friend.username,
                text: "Thanks for your message! This is a simulated reply.",
                timestamp: new Date().toLocaleTimeString()
            };
            setChatHistory(prevChat => [...prevChat, replyMessage]);
        }, 1500);
    };

    return (
        <div className="chat-box">
            <div className="chat-header">
                <div className="chat-user-info">
                    <img src={friend.profilePicUrl} className="chat-avatar" alt={friend.username} />
                    <span>{friend.username}</span>
                </div>
                <button className="close-chat-btn" onClick={onClose}>
                    <X size={18} />
                </button>
            </div>
            
            <div className="chat-messages">
                {loading ? (
                    <div className="loading-chat">Loading messages...</div>
                ) : chatHistory.length > 0 ? (
                    chatHistory.map((msg) => (
                        <div 
                            key={msg.id} 
                            className={`message ${msg.sender === 'me' ? 'sent' : 'received'}`}
                        >
                            <div className="message-content">
                                <p>{msg.text}</p>
                                <span className="message-time">{msg.timestamp}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-chat">No messages yet. Say hello!</div>
                )}
            </div>
            
            <form className="chat-input" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                />
                <button type="submit" className="send-btn">
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
};

const FriendsPage = () => {
    const { authUser } = useAuthContext();
    const [friends, setFriends] = useState([]);
    const [activeChatFriend, setActiveChatFriend] = useState(null);

    useEffect(() => {
        const getFriends = async () => {
            try {
                const res = await fetch('/api/user/getfriends', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const data = await res.json();
                
                if (data.error) throw new Error(data.error);
                
                setFriends(data.userFriends || []);
            } catch (error) {
                console.error(error);
                toast.error(error.message);
            }
        };
        
        getFriends();
    }, []);

    const handleOpenChat = (friend) => {
        setActiveChatFriend(friend);
    };

    const handleCloseChat = () => {
        setActiveChatFriend(null);
    };

    return (
        <div className="social-container">
            <LeftSideBar />
            
            {/* Main Content */}
            <main className="main-content">
                <Header />
                
                <div className="content-wrapper">
                    <div className="friends-list">
                        <h2>Your Friends</h2>
                        {Array.isArray(friends) && friends.length > 0 ? (
                            friends.map((friend) => (
                                <div className="friend-item" key={friend.username}>
                                    <div className="friend-info-wrapper">
                                        <img src={friend.profilePicUrl} className="avatar" alt="profile" />
                                        <div className="friend-info">
                                            <Link to={`/profile/${friend.username}`} style={{textDecoration:'none'}}>
                                                <h4>{friend.username}</h4>
                                            </Link>
                                        </div>
                                    </div>
                                    <button 
                                        className="message-btn"
                                        onClick={() => handleOpenChat(friend)}
                                    >
                                        Message
                                    </button>
                                </div>
                            ))
                        ) : (
                            <h3>No friends to show</h3>
                        )}
                    </div>
                </div>
            </main>
            
            <RightSideBar />
            
            {/* Chat box that appears when messaging */}
            {activeChatFriend && (
                <ChatBox 
                    friend={activeChatFriend} 
                    onClose={handleCloseChat} 
                />
            )}
        </div>
    );
};

export default FriendsPage;