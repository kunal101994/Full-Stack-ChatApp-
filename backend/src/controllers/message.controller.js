import User from "../models/user.model.js";
import Message from "../models/message.model.js";

export  const getUsersForSidebar = async(req, res) =>{
  try {
    const loggedInUserId  = req.user._id;
    const filteredUsers = await User.find({
      _id: {
        $ne: loggedInUserId,
      }
    }).select("-password");
    res.status(200).json({
      success: true,
      data: filteredUsers,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}


export const getMessages = async(req, res) =>{
  try {
    const { id:userToChatId } = req.params;

    const senderId = req.user._id;
    
    const messages = await Message.find({
      $or: [
        {
          senderId,
          receiverId: userToChatId,
        },
        {
          senderId: userToChatId,
          receiverId: senderId,
        },
      ],
    }) 

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}



export const sendMessage = async (req, res) =>{
  try {
    const {  text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
    

    let imageUrl;
    if(image){
      // upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    })
    
    // SAVE INTO THE DATABASE
    await newMessage.save();

    // todo: realtime functionality goes here => socket.io

    res.status(201).json({
      success: true,
      data: newMessage,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}