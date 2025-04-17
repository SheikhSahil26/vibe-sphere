const User = require("../models/userModel")
const path=require("path")
const cloudinary=require("../utils/cloudinary")
const fs=require("fs")

// to see the profile of the user 
// be it logged in user see his own profile or other person sees his/her profile
async function seeProfile(req, res) {
    try{
        const username = req.params.username;

    const findUser = await User.findOne({ username: username });

    if (!findUser) {
        return res.status(404).json({
            error: "Not Found!!",
        })
    }

    return res.status(200).json({
        _id:findUser._id,
        username: findUser.username,
        profilePicUrl: findUser.profilePicUrl,
        followers: findUser.followers,
        followings: findUser.followings,
        totalPosts: findUser.totalPosts,
        bio: findUser.bio,
    })
    }
    catch(error){
        console.log(error)
        return res.status(500).json({
            error:"internal server error"
        })
    }
}


//to follow and unfollow user 
async function followUnFollowUser(req,res){

    try{
        const userToFollow=await User.findOne({username:req.params.username});

        const currentUser=await User.findOne({_id:req.user._id});

        console.log(currentUser.followings)

       
        // check if the logged in user already follows the user or not if follows then remove it from the array of followers of the profile user or add it to the array.....
        const found=currentUser.followings.find(id=>id.toString()===userToFollow._id.toString())

        console.log(found)

        if(!found){

            currentUser.followings.push(userToFollow._id);

            userToFollow.followers.push(currentUser._id);

           await  userToFollow.save();
            await currentUser.save();

            console.log(currentUser.followings);
    
            return res.status(200).json({
                followed:"followed",
            })
        }
        
        currentUser.followings= currentUser.followings.filter(id=>id===userToFollow._id)
        userToFollow.followers= userToFollow.followers.filter(id=>id===currentUser._id);
    
       await currentUser.save();
        await userToFollow.save();

    
        return res.status(200).json({
            unfollowed:"unfollowed", 
        })
    }
    catch(error){
        console.log(error)
        return res.status(500).json({
            error:"internal server error",
        })
    }
}


//to edit profile
async function editProfile(req,res){
    try{
        const {username,bio}=req.body;

        

          const response = await cloudinary.uploader.upload(req.file.path,{
                    resource_type:"auto",
                })
                console.log(response.url);
        
        const user=await User.findOne({_id:req.user.id});

        const existingAlready= await User.findOne({username:username})

        //we check if the edited username is not equal to any existing user other than the users himself username 
        if(existingAlready && existingAlready._id.toString()!==req.user._id.toString())return res.status(400).json({error:"this username already present"});

        user.username=username;
        user.bio=bio;
        user.profilePicUrl=response.url;

        console.log(req.file.path)
        console.log(user.profilePicUrl)

        fs.unlinkSync(req.file.path)

        await user.save();
 
        return res.status(200).json({
            success:"profile updated successfully",
            _id:user._id,
            username:user.username,
            bio:user.bio,
            profilePicUrl:user.profilePicUrl,
            followers: user.followers,
            followings: user.followings,
            totalPosts: user.totalPosts,


        })

    }
    catch(error){
        console.log(error)
        return res.status(500).json({
            error:"internal server error",
        })
    }

    
}

// to get allusers apart from the logged in user to show as suggestions in frontend
//will only send the 3 users so that it doesnt become a heavy api
async function getAllUsers(req,res){

    // console.log(req.user)

    const loggedInUserId=req.user._id

    try{
        const allUsers=await User.find({_id:{$ne:loggedInUserId}}).limit(3);

        // console.log(allUsers);

        return res.status(200).json({
            users:allUsers
        })
    }catch(error){ 
        return res.status(500).json({
            error:"error fetching all users for displaying in homepage"
        })
    }

   

}


async function getUserFriends(req,res){

    try{
        const {followings}=await User.findById(req.user._id).select('followings -_id');

        console.log(followings)

    const userFriends=[];

    for(let i=0;i<followings.length;i++){

        const detail= await User.findById(followings[i]).select('username profilePicUrl -_id');

        userFriends.push(detail);
    }

    console.log(userFriends)




    return res.status(200).json({
        userFriends:userFriends
    })



    }catch(error){
        console.log(error)
        return res.status(400).json({
            error:"somethings off during fetching friends"
        })
    }

    




}


module.exports = {
    seeProfile,
    followUnFollowUser,
    editProfile,
    getAllUsers,
    getUserFriends
}