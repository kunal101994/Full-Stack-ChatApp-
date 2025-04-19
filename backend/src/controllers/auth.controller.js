import { generateToken } from "../lib/utils.js";
import  User  from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";

import bcrypt from "bcryptjs";

export const signup = async (req, res) =>{
     const {email, fullName, password} = req.body;
    try {
      
       // validate email  
       if(!email || !fullName || !password){
        return res.status(400).json({ message: "Please fill all fields"});
      }

      // hash password
      if(password.length < 6){
        return res.status(400).json({ message: "Password must be at least 6 characters"});
      }

      const user = await User.findOne({ email });
      if(user){
        return res.status(400).json({ message: "User already exists"});
      }

      // hashed the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = new User({
        email,
        fullName,
        password: hashedPassword,
      });

     if(newUser){
      generateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
     } else {
      res.status(400).json({
        success: false,
        message: "User not created",
      });
     }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
}

export const login = async (req, res) =>{
  const {email, password} = req.body;
    try {
       const user = await User.findOne({ email });
       if(!user){
        return res.status(400).json({ message: "User not found"});
       }

       const isPasswordCorrect = await bcrypt.compare(password, user.password);
       if(!isPasswordCorrect){
        return res.status(400).json({ message: "Invalid credentials"});
       }

       generateToken(user._id, res);
       res.status(200).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
        });
    } catch (error) {
      conssole.log(error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
}

export const logout = async (req, res) =>{
    try {
      res.cookie("jwt", "", {maxAge:0})
      res.status(200).json({
        success: true,
        message: "Logout successful",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
}



export const updateProfile = async (req, res) =>{
 try {
  const {profilePic} = req.body;
  const userId = req.user._id;

if(!profilePic){
  return res.status(400).json({
    success: false,
    message: "Please provide a profile picture",
  });
}

 const uploadResponse = await cloudinary.uploader.upload(profilePic);

 const updatedUser = await User.findByIdAndUpdate(userId, {
  profilePic: uploadResponse.secure_url,
 }, {new: true});

 res.status(200).json({
  success: true,
  message: "Profile updated successfully",
  data: updatedUser,
 });

 } catch (error) {
  console.log(error);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
 }
    }


    export const checkAuth = async(req, res) =>{
      try {
        res.status(200).json(req.user);
      } catch (error) {
        console.log(error);
        res.status(500).json({
          success: false,
          message: "Internal Server Error",
        });
      }
    }