import User from "../models/userModel.js";
import bcrypt from "bcryptjs"
import jwt from 'jsonwebtoken';
import Post from "../models/postModel.js";


export const registerUser = async (req, res) => {
    try {
        const {
            fullName, userName, email, password, profilePicture, 
            gender, phoneNumber, dateOfBirth
        } = req.body;

        const role = 'User';

        if(!fullName || !userName || !email || !password || !profilePicture || !gender || !phoneNumber || !dateOfBirth){
            return res.status(404).json({success: false, message: "All fields required!"})
        }

        const existingUser = await User.findOne({ 
            $or: [{ email }, { userName }] 
        });

        if (existingUser) {
            return res.status(404).json({
                success: false,
                message: "User already exists with this email or username"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            fullName, 
            userName, 
            email, 
            password: hashedPassword, 
            profilePicture, 
            gender, 
            phoneNumber, 
            dateOfBirth
        })

        await user.save();

        res.status(200).json({success: true, message: "Your Registration has been successfull!"})





        
    } catch (error) {
        console.log(error);
        return res.status(500).json({success: false, message: "Something Went Wrong"})
    }
}


export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(404).json({ success: false, message: "All fields required!" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) { 
            return res.status(404).json({ success: false, message: "Invalid email or password" });
        }

        if(!user.isVerified){
            return res.status(404).json({ success: false, message: "Please verify your email address." });
        }
        if(user.accountStatus === 'InActive'){
            return res.status(404).json({ success: false, message: "Your account is inactive" });
        }
        if(user.accountStatus === 'Suspended'){
            return res.status(404).json({ success: false, message: "Your account is suspended" });
        }
        if(user.accountStatus === 'DeActivated'){
            return res.statuc(404).json({ success: false, message: "Your account is deactivated" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        return res.status(200).json({
            success: true, 
            message: "Login Successfully",
            user,
            token
        })

        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Something Went Wrong" });
    }
}


export const getUserDetails = async (req, res) => {
    try {
        const {userName} = req.params;
        let user = await User.findOne({userName}).select("-password -isVerified -accountStatus -phoneNumber -dateOfBirth -address -lastLogin -createdAt -updatedAt -__v -email -lockUntil")
        
        if(!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const followers = await User.find({ _id: { $in: user.followers } }, "profilePicture userName");
        const following = await User.find({ _id: { $in: user.following } }, "profilePicture userName");
        user = {
            ...user.toObject(),
            followers,
            following
        };

        const posts = await Post.find({ userId: user._id })
            .populate("userId", "fullName userName profilePicture")
            .sort({ createdAt: -1 });

        
            

        return res.status(200).json({ success: true, message: "User details fetched successfully", user, posts });


    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Something Went Wrong" });
        
    }
}




//  ------------------------ User Following and Unfollowing ------------------------ //

export const followUser = async (req, res) => {
    try {
        const { userId } = req.body;
        const loggedInUserId = req.user.id;

        if (userId === loggedInUserId) {
            return res.status(400).json({ success: false, message: "You cannot follow yourself" });
        }

        const userToFollow = await User.findById(userId);
        const loggedInUser = await User.findById(loggedInUserId);

        if (!userToFollow || !loggedInUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (loggedInUser.following.includes(userId)) {
            return res.status(400).json({ success: false, message: "You are already following this user" });
        }

        loggedInUser.following.push(userId);
        userToFollow.followers.push(loggedInUserId);

        await loggedInUser.save();
        await userToFollow.save();

        return res.status(200).json({ success: true, message: "Successfully followed the user", userToFollow });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Something Went Wrong" });
    }
}

export const unfollowUser = async (req, res) => {
    try {
        const { userId } = req.body;
        const loggedInUserId = req.user.id;

        if (userId === loggedInUserId) {
            return res.status(400).json({ success: false, message: "You cannot unfollow yourself" });
        }

        const userToUnfollow = await User.findById(userId);
        const loggedInUser = await User.findById(loggedInUserId);

        if (!userToUnfollow || !loggedInUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (!loggedInUser.following.includes(userId)) {
            return res.status(400).json({ success: false, message: "You are not following this user" });
        }

        loggedInUser.following.pull(userId);
        userToUnfollow.followers.pull(loggedInUserId);

        await loggedInUser.save();
        await userToUnfollow.save();

        return res.status(200).json({ success: true, message: "Successfully unfollowed the user", userToUnfollow });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Something Went Wrong" });
    }
}