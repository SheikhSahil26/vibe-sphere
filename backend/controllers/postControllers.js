const Post = require("../models/postModel");
const User = require("../models/userModel")
const Comment = require("../models/commentModel")
const { findByIdAndUpdate, findById } = require("../models/userModel");
const cloudinary = require("../utils/cloudinary")
const fs = require("fs")
const Story = require("../models/storyModel")
const { getAllUsers } = require("./userControllers")
const database=require('../utils/firebaseConfig')

//this is for showing all post in the homepage of the platform
async function getAllPosts(req, res) {

    try {
        //fetching post after sorting them in descending order of their created time so we get the latest post first
        const Posts = await Post.find().populate('postedBy', 'username profilePicUrl').sort({ createdAt: -1 });
        //postedBy is a refrence to another object model so from that we want only the username and profilepic of user thats y populate.....
        // console.log("posts", Posts)
        return res.status(200).json({
            posts: Posts,
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error: "error fetching posts!!!",
        })
    }
}

//to add post
async function addPost(req, res) {
    try {
        const { postCaption } = req.body;

        let imageUrl = ""

        const response = await cloudinary.uploader.upload(req.file.path, {
            resource_type: "auto",
        })
        console.log(response.url);
        const userPosts = await Post.find({ postedBy: req.user._id });

        // console.log(req.user);
        // console.log(req.user.bio);

        const newPost = new Post({
            postImageUrl: response.url,
            postCaption,
            postedBy: req.user._id,
            postlikes: [],
            postComments: [],
            publicId: response.public_id,
        })
        if (newPost) {
            await newPost.save()

            const user = await User.findById(req.user._id);

            user.totalPosts = userPosts.length + 1;

            await user.save();

            fs.unlinkSync(req.file.path)

            return res.status(200).json({
                success: "posted successfully",
                msg: "image uploaded to cloud successfully"
            })
        }
        else {
            return res.status(500).json({
                failed: "failed to upload your post due to some technical error!!",
            })
        }
    }
    catch (error) {
        console.log(error)

        return res.status(500).json({
            error: "internal server error",
        })
    }
}

//to delete post
async function deletePost(req, res) {
    try {
        const post = await Post.findOne({ _id: req.params.id })

        console.log(post);
        console.log(req.user._id)

        const userPosts = await Post.find({ postedBy: req.user._id })



        if (post.postedBy.toString() !== req.user._id.toString()) {
            return res.status(400).json({
                error: "you are not authorized to delete this post!!",
            })
        }

        const user = await User.findById(req.user._id);

        if (user.totalPosts == 0) {
            return res.status(400).json({
                error: "cant delete no post",
            })
        }

        await cloudinary.destroy(post.publicId);

        await Post.deleteOne({ _id: req.params.id });



        user.totalPosts = userPosts.length - 1;

        await user.save();



        return res.status(200).json({
            success: "post deleted successfully",
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({

            error: "failed to delete post",
        })
    }
}


//to comment on the post
async function commentOnPost(req, res) {
    try {
        const { commentBody } = req.body;

        const post = await Post.findById(req.params.id);

        console.log(post)

        const newComment = new Comment({
            commentBody,
            createdBy: req.user._id,
            forPost: req.params.id,
        })

        await newComment.save();

        post.postComments.push(newComment._id);

        await post.save();


        return res.status(200).json({
            success: "comment added successfully",
        })
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({
            error: "internal server error",
        })
    }
}

// to delete the comment 
async function deleteComment(req, res) {
    try {
        const comment = await Comment.findById(req.params.id)

        let post = await Post.findById(comment.forPost);

        console.log(post);

        if (req.user._id.toString() !== comment.createdBy.toString()) {
            return res.status(400).json({
                error: "you are not authorized to delete this comment!!!"
            })
        }


        let newArray = post.postComments.filter(id => id.toString() !== req.params.id);

        post.postComments = newArray;

        await post.save();

        await Comment.deleteOne({ _id: req.params.id });

        return res.status(200).json({
            success: "comment deleted successfully"
        })



    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error: "internal server error",
        })
    }
}


//to do like and dislike on the post 
async function likeDislikePost(req, res) {
    try {

        const post = await Post.findById(req.params.id);

        const userId = req.user._id;

        const found = post.postLikes.find(id => id.toString() === userId.toString());
        console.log(found);//first check if the loggedIn user already liked the post of this user or not and if he does then do do unlike or else like the post as below 
        if (!found) {
            post.postLikes.push(req.user._id);

            await post.save();

            return res.status(200).json({
                liked: "liked",
                likesNum: post.postLikes.length   //the postLikes is an array containing the user ids of the users who liked the post 
            })
        }

        post.postLikes = post.postLikes.filter(id => id.toString() !== userId.toString())

        await post.save();

        return res.status(200).json({
            unliked: "unliked",
            likesNum: post.postLikes.length
        })
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({
            error: "internal server error",
        })
    }
}

// to report a post but this controller is pending !!!!
async function reportPost(req, res) {
    const { reportBody } = req.body;

    const post = await Post.findById(req.params.id)

    if (post.report.length === 10) {
        //send the message(warning) to the post owner to 
    }
    else if (post.report.length > 10) {
        //delete post 
    }
}

//to show the post of the user whose profile is opened 
async function getUserPosts(req, res) {

    try {
        const user = await User.findOne({ username: req.params.username });

        const posts = await Post.find({ postedBy: user._id }).sort({ createdAt: -1 }); //sorted on the basis of recent creation time



        if (posts) {
            return res.status(200).json({
                posts: posts,
            })
        }

    } catch (error) {
        return res.status(500).json({
            error: "error fetching post of user"
        })
    }


}

async function getPostComments(req, res) {

    const postId = req.params.postId;

    try {
        const comments = await Comment.find({ forPost: postId }).sort({ createdAt: -1 });

        if (!comments) {
            return res.status(404).json({
                error: "error fetching comments"
            })
        }

        console.log(comments)

        return res.status(200).json({
            noOfComments: comments.length,
            comments: comments,
        })



    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error: "error fetching comments of user"
        })
    }

}


//function to delete the story after the specified time 

const scheduleDeletion = (storyId, expirationTime, userId, publicId) => {
    const delay = expirationTime.getTime() - Date.now();

    console.log("reached deletion function")

    setTimeout(async () => {
        try {
            const user = await User.findById(userId)

            user.stories = user.stories.filter((story) => story._id.toString() !== storyId.toString())

            await Story.findByIdAndDelete(storyId);

            await cloudinary.uploader.destroy(publicId);

            await user.save();

            console.log(`Story ${storyId} deleted after expiration.`);
        } catch (error) {
            console.error("Error deleting story:", error);
        }
    }, delay);
};


async function addStory(req, res) {
    try {
        console.log(req.file.path)
        console.log(req.user)

        const response = await cloudinary.uploader.upload(req.file.path, {
            resource_type: "auto",
        })

        //this is the public id of the image uploaded in the cloudinary to use it for deletion 
        const publicId = response.public_id;


        console.log(response)

        const expirationTime = new Date();


        expirationTime.setSeconds(expirationTime.getSeconds() + 40);

        const newStory = new Story({
            storyContentUrl : response.url,
            postedBy : req.user._id,
            expiresAt : expirationTime,
            publicId:publicId
        })



        if (newStory) {
            await newStory.save();
            await User.findByIdAndUpdate(req.user._id, {
              $push: { stories: newStory._id }
            });
            const username=req.user.username
            const profilePicUrl=req.user.profilePicUrl;  


            const userRef=database.ref(`myDB/stories/users/${username}`)

            userRef.set({username,profilePicUrl}).then(()=>console.log("data added to firebase")).catch((err)=>{
                console.log(err);
                console.log("there is an error in storing the stories in the firebase")
            })

            

            fs.unlinkSync(req.file.path)



            return res.status(200).json({
                success: "story posted",
            })



        }
        else {
            return res.status(500).json({
                error: "failed to upload story"
            })
        }




    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: "cant post story due to internal server error",
        })
    }
}

// this is function is to get the stories of the users whom our logged in user follows
//my logic: use HashMap to store the user as key and stories array as value 
// map={
//  user1:[story1,story2,story3,.....storyN],
//  user2:[story1,.........storyN],
//} is this efficient logic??????? dont know will later check for the optimizations

async function getAllUserStories(req, res) {

    //later i will do implementation of efficient story feature

    try {
        const user = await User.findById(req.user._id).select("followings");

        const followedUserIds = user.followings.map((id) => id.toString());

        //pushing the loggedIn user in the followings list so that his/her story is also included in the stories list
        followedUserIds.push(req.user._id.toString());

        const stories = await Story.find({ postedBy: { $in: followedUserIds } })
            .populate('postedBy')
            .sort({ createdAt: -1 });

        console.log(stories);

        const storyMap = new Map();

        stories.forEach((story) => {
            const username = story.postedBy.username;

            if (!storyMap.has(username)) {
                storyMap.set(username, []);
            }

            storyMap.get(username).push(story);
        });

        console.log(storyMap);

        return res.status(200).json({
            stories: Object.fromEntries(storyMap)
        })
    } catch (error) {
        console.log(error)

        return res.status(400).json({
            error: "error fetching stories"
        })

    }
} 

async function getUsersWhoPostedStories(req, res) {

    try {
        const user = await User.findById(req.user._id).select("followings");

        const followedUserIds = user.followings.map((id) => id.toString());

        //pushing the loggedIn user in the followings list so that his/her story is also included in the stories list
        followedUserIds.push(req.user._id.toString());

        const stories = await Story.find({ postedBy: { $in: followedUserIds } })
            .populate('postedBy')
            .sort({ createdAt: -1 });


        // console.log(stories)

        const users = []

        for (let i = 0; i < stories.length; i++) {
            users.push({ username: stories[i].postedBy.username, profilePicUrl: stories[i].postedBy.profilePicUrl });
        }

        const uniqueUsers = [];
        const seenUsernames = new Set();

        for (const user of users) {
            if (!seenUsernames.has(user.username)) {
                seenUsernames.add(user.username);
                uniqueUsers.push(user);
            }
        }

        // console.log(uniqueUsers)
        

        return res.status(200).json({
            users: uniqueUsers
        })

    } catch (error) {
        console.log("this is error",error)

        return res.status(500).json({
            error: "error fetching the users who posted stories"
        })

    }

}

async function getStories(req, res) {

    try {
        const user = await User.findOne({username:req.params.username});

        const stories = await Story.find({ postedBy: user._id }).populate('postedBy');

        console.log(typeof(stories));

        console.log(stories)

        return res.status(200).json({
            stories: stories,
        })



    } catch (error) {
        console.log(error)
        return res.status(400).json({
            error: "unable to fetch the stories of this user"
        })
    }
}


module.exports = {
    getAllPosts,
    addPost,
    deletePost,
    commentOnPost,
    deleteComment,
    likeDislikePost,
    reportPost,
    getUserPosts,
    getPostComments,
    addStory,
    getAllUserStories,
    getUsersWhoPostedStories,
    getStories
}