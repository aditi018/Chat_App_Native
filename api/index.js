const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/User");
const Message = require("./models/Message");

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