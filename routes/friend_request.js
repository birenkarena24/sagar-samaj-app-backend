const { Router } = require("express");
const { FriendRequestModel, UserModel } = require("../db");
const { userMiddleware } = require("../middleware/user");

const requestRouter = Router();

// when user wants to send a friend request
requestRouter.post("/send", userMiddleware, async function(req, res){
    const senderId = req.userId;

    try{
        await FriendRequestModel.create({
            senderId: senderId,
            receiverId: req.body.receiverId,
            message: req.body.message
        })

        res.status(200).json({
            msg: "friend request sent successfully"
        })
    } catch (err) {
        res.status(500).json({
            msg: "internal server error"
        })
    }
})

// when user wants to see his sent requests
requestRouter.get("/sent", userMiddleware, async function(req, res){
    const userId = req.userId;

    try{
        const sentRequests = await FriendRequestModel.find({
            senderId: userId
        })

        res.status(200).json(sentRequests);
    } catch (err) {
        res.status(500).json({
            msg: "internal server error"
        })
    }
})

// when user wants to see his received requests
requestRouter.get("/received", userMiddleware, async function(req, res){
    const userId = req.userId;

    try{
        const receivedRequests = await FriendRequestModel.find({
            receiverId: userId
        })

        res.status(200).json(receivedRequests);
    } catch (err) {
        res.status(500).json({
            msg: "internal server error"
        })
    }
})

// when user wants to cancel his sent request
requestRouter.post("/cancel", userMiddleware, async function(req, res){
    const userId = req.userId;
    const requestId = req.body.requestId;

    try{
        const request = await FriendRequestModel.findOneAndDelete({
            _id: requestId,
            senderId: userId
        })
        
        if(!request){
            return res.status(404).json({
                msg: "request not found"
            })
        }

        res.status(200).json({
            msg: "request canceled successfully"
        })
    } catch (err) {
        res.status(500).json({
            msg: "internal server error"
        })
    }
})

// when user wants to accept or reject a received request
requestRouter.post("/approval", userMiddleware, async function(req, res){
    const receiverId = req.userId;
    const isApproved = req.body.isApproved;
    const requestId = req.body.requestId;

    try{
        const request = await FriendRequestModel.findOne({
            _id: requestId,
            receiverId: receiverId
        })

        if(!request){
            return res.status(404).json({
                msg: "friend request not found"
            })
        }
        
        const senderId = request.senderId

        if(isApproved){
            await UserModel.findOneAndUpdate({
                _id: receiverId
            }, {
                $push: { myFriendList: senderId }
            })

            await UserModel.findOneAndUpdate({
                _id: senderId
            }, {
                $push: { myFriendList: receiverId }
            })
        }

        await FriendRequestModel.findOneAndDelete({
            _id: requestId
        })

        res.status(200).json({
            msg: "request processed successfully"
        })
    } catch (err) {
        res.status(500).json({
            msg: "internal server error"
        })
    }
})

module.exports = {
    requestRouter
}