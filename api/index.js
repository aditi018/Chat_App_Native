const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/User");
const Message = require("./models/Message");
const multer = require("multer")

const app = express();
const port = 8000;
const cors = require("cors");
app.use(cors());

app.use(bodyParser.urlencoded({ extended : false}));
app.use(bodyParser.json());
app.use(passport.initialize());
const jwt = require("jsonwebtoken");

const createToken = (userId) =>{
    const payload = {
        userId : userId,
    }

    const token = jwt.sign(payload, "Qwertyuiiopasad",{ expiresIn : "5h"});

    return token;
}


//Registration of user
app.post("/register",(req,res) => {
    const { name,email,password,image } = req.body;

    const newUser = new User({
        name,
        email,
        password,
        image
    })

   newUser.save().then(() =>{
    res.status(200).json({
        success : true,
        message : "User registered successfully",
    })
   }).catch((err) => {
    console.log("Error occurred :",err);
    res.status(500).json({
        success : false,
        message : "Registration failed"
    })
   });
})


//Login user
app.post("/login",async(req,res) =>{
    const { email, password } = req.body;

    if(!email || !password){
        return res.status(404).json({
            success : false,
            message : "Email and password are required",
        })
    }

    try{
        const user = await User.findOne({email});

        if(!user){
            return res.status(404).json({
                success : false,
                message : "User not found"
            })
        }
        if(user.password !== password){
            return res.status(404).json({
                success : false,
                message : "Invalid password"
            })
        }

        const token = createToken(user._id);
        res.status(200).json({
            success : true,
            data : token,
        })
    }catch(error){
        console.log("Error during login",error);
        res.status(500).json({
            success : false,
            message : "Internal server error"
        })
    }
})


//Access all user except th eon ecurrently logged in
app.get("/users/:userId",async(req,res)=>{
    const loggedInUserId = req.params.userId;


    User.find({_id : {$ne:loggedInUserId}}).then((users) => {
        res.status(200).json({
            users
        })
    }).catch((err)=>{
        res.status(500).json({
            message : "Error retriving users."
        })
    })
})

//To send request to a user
app.post("/friend-request",async(req,res)=>{
    const { currentUserId, selectedUserId} = req.body;

    try{
        //update receipents friendRequest Array
        await User.findByIdAndUpdate(selectedUserId,{
            $push:{friendRequests : currentUserId}
        })

        //update senders sentFriendRequest array
        await User.findByIdAndUpdate(currentUserId,{
            $push:{sentFriendRequests : selectedUserId}
        })

        res.status(200).json({
            message : "Friend Request sent successfully"
        });
    }catch(err){
        res.status(500).json({
            message : "Could not send the request",
            err
        })
    }
})

//show all friend requests of a particular user
app.get("/friend-request/:userId",async(req,res)=>{
    try{
        const userId = req.params.userId;
        const user = await User.findById(userId).populate("friendRequests","name email image").lean();

        const friendRequests = user.friendRequests;

        res.status(200).json({
            message : "Friend Requests fetched",
            data : friendRequests
        });

    }catch(err){
        console.log("Error:",err);
        res.status(500).json({
            message: "Internal server error",
        })
    }
})

//accept friend request
app.post("/friend-request/accept",async(req,res) => {
    try{
        const {senderId, recepientId} = req.body;

        const sender = await User.findById(senderId);
        const recepient = await User.findById(recepientId);

        sender.friends.push(recepientId);
        recepient.friends.push(senderId);

        recepient.friendRequests = recepient.friendRequests.filter((request) => request.toString() !== senderId.toString());

        sender.sentFriendRequests = sender.sentFriendRequests.filter((request) => request.toString() !== recepientId.toString());


        await sender.save();
        await recepient.save();

        res.status(200).json({
            message : "Friend Request Accepted"
        })
    }catch(err){
        console.log("Error:",err);
        res.status(500).json({
            message : "Internal server error"
        })
    }
})

//access all the friends of the logged in user
app.get("/accepted-friends/:userId",async(req,res)=>{
    try{
        const { userId} = req.params;
        const user = await User.findById(userId).populate("friends","name email image");

        const acceptedFriends = user.friends;

        res.status(200).json(acceptedFriends);


    }catch(err){
        console.log(err);
        res.status(500),json({
            message : "Internal Server Error",
        })
    }
})


const storage =  multer.diskStorage({
    destination : function(req, file, cb){
        cb(null, 'files/');
    },
    filename : function(req,file,cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null,uniqueSuffix+'-'+file.originalname);
    }
})

const upload = multer({ storage : storage });

//store messages in backend
app.post("/messages",upload.single('imageFile'),async(req,res)=>{
    try{
        const { senderId, recepientId, messageType, messageText} = req.body;
        const newMessage = new Message({
            senderId,
            recepientId,
            messageType,
            message : messageText,
            timeStamp  : new Date(),
            imageUrl : messageType === "image" ?req.file.path : null,
        });

        await newMessage.save();

        res.status(200).json({
            message : "Message sent successfully"
        })
    }catch(err){
        console.log("Error while storing the message ",err);
        res.status(500).json({
            error:  "Internal server error",
        })
    }
})


//get the userDetails to design the chat room header
app.get("/user/:userId",async(req,res) => {
    try{
        const { userId } = req.params;

        const recepientId = await User.findById(userId);

        res.json(recepientId);
    }catch(err){
        console.log("error",err);
        res.status(500).json({
            error : "Internal server error",
        })
    }
});

//fetch messages between 2 users in the chat room
app.get("/messages/:senderId/:recepientId",async(req,res) => {
    try{
        const { senderId , recepientId } = req.params;
        const messages = await Message.find({
            $or:[
                {senderId : senderId, recepientId: recepientId},
                {senderId : recepientId, recepientId:senderId},
            ]
        }).populate(
            "senderId","_id name"
        )

        res.status(200).json(messages);
    }catch(err){
        console.log("Error",err);
        res.status(500).json({
            error : "Internal server error",
        })
    }
})

//delete message
app.post("/deleteMessages",async(req,res) => {
    try{
        const {messages} = req.body;
        if(!Array.isArray(messages) || messages.length ===0){
            return res.status(400).json({
                message : "Invalid req body"
            })
        }

        await Message.deleteMany({_id : {$in: messages}});

        res.status(200).json({
            message : "Message deleted successfully"
        })
    }catch(err){
        console.log("Error",err);
        res.status(500).json({
            message : "Internal Server Error",
        })
    }
})

app.get("/friend-requests/sent/:userId",async(req,res) => {
    try{
        const { userId } = req.params;
        const user = await User.findById(userId).populate("sentFriendRequests", " name email image").lean();

        const sentFriendRequests = user.sentFriendRequests;

        res.status(200).json(sentFriendRequests);
    }catch(err){
        console.log("Error : ",err);
        res.status(500).json({
            message : "Internal server error"
        })
    }
})

app.get("/friends/:userId",async(req,res) => {
    try{
        const { userId} = req.params;

        User.findById(userId).populate("friends").then((user) => {
            if(!user){
                return res.status(404).json({
                    message : "User not found"
                })
            }

            const friendIds = user.friends.map((friend) => friend._id)

            res.status(200).json(friendIds);
        })
    }catch(err){
        console.log(err);
        res.status(500).json({
            message : "Internal server error"
        })
    }
})

mongoose.connect("mongodb+srv://aryanpandey0715:Arti1971@cluster0.1krqlwz.mongodb.net/",{
    useNewUrlParser : true,
    useUnifiedTopology : true,
}).then(()=>{
    console.log("Connected to database")
}).catch((error)=>{
    console.log("Error connecting to database",error);
})

app.listen(port,()=>{
    console.log(`App is listening to port ${port}`)
});