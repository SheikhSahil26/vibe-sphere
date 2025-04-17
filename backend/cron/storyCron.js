const cron = require("node-cron");
const Story = require("../models/storyModel")
const User = require("../models/userModel")
const cloudinary = require("cloudinary").v2;
const database = require('../utils/firebaseConfig'); // adjust path as needed
const mongoose=require("mongoose")


cron.schedule("*/10 * * * * *", async () => {
  try {
    
    const now = new Date();
    
    const expiredStories = await Story.find({ expiresAt: { $lte: now } });

    // mongoose.set('debug', true);

    for (const story of expiredStories) {
      console.log("entered for loop for deletion")
      // Removed from Cloudinary
      await cloudinary.uploader.destroy(story.publicId);

      console.log("this is user id", story.postedBy)

      const user = await User.findById(story.postedBy);

      // Removed from user's stories array
      // const updatedUser = await User.findByIdAndUpdate(story.postedBy, {
      //   $pull: { stories: { $in: [story._id] } }
      // }, { new: true });

      const updatedUser = await User.findByIdAndUpdate(
        story.postedBy,
        { $pull: { stories: story._id } },
        { new: true }
      );


      console.log(updatedUser)

      if (updatedUser) {
        console.log("user has been updated with stories getting deleted!!!");
      }
      else {
        console.log("user hasnt been updated with stories getting deleted!!")
      }


      if (updatedUser.stories.length === 0) {
        //will do here the firebase activities for realtime data
        const userRef = database.ref(`myDB/stories/users/${updatedUser.username}`);

        console.log("story has been deleted from all the places")

        userRef.remove()
          .then(() => {
            console.log(`Firebase data for user ${updatedUser.username} removed successfully.`);
          })
          .catch((err) => {
            console.error(`Failed to delete Firebase data for user ${updatedUser.username}:`, err);
          });

      }




      await Story.findByIdAndDelete(story._id);





    }
  } catch (err) {
    console.error("Cron cleanup error:", err);
  }
});         
