const { Router } = require("express");
const { ChatModel } = require("../db");
const { userMiddleware } = require("../middleware/user");

const chatRouter = Router();

// when user wants to add new chat
chatRouter.post("/create", userMiddleware, async function(req, res){
    try
    {
        await ChatModel.create({
            chatContent: req.body.chatContent,
            userId: req.userId,
            createdAt: req.body.createdAt,
            replies: [],
            isHidden: false
        })

        res.status(200).json({
            msg: "Chat added successfully"
        })
    } catch (err) {
        res.status(500).json({
            msg: "Internal server error"
        });
    }
})

// when user wants to edit his chat
chatRouter.put("/edit", userMiddleware, async function(req, res){
    const userId = req.userId;
    const chatId = req.body.chatId;

    try
    {
        const chat = await ChatModel.findOneAndUpdate({
            _id: chatId,
            userId: userId
        }, {
            chatContent: req.body.chatContent
        })

        if(!chat){
            return res.status(404).json({
                msg: "chat not found"
            })
        }

        res.status(200).json({
            msg: "chat updated successfully"
        })
    } catch (err) {
        res.status(500).json({
            msg: "Internal server error"
        });
    }
})

// when user wants to delete his chat
chatRouter.delete("/delete", userMiddleware, async function(req, res){
    const userId = req.userId;
    const chatId = req.body.chatId;

    try
    {
        const chat = await ChatModel.findOneAndDelete({
            _id: chatId,
            userId: userId
        })

        if(!chat){
            return res.status(404).json({
                msg: "chat not found"
            })
        }

        res.status(200).json({
            msg: "chat deleted successfully"
        })
    } catch (err) {
        res.status(500).json({
            msg: "Internal server error"
        });
    }
})

// when user wants to see his chats and replies
chatRouter.get("/my-chats", userMiddleware, async function(req, res){
    const userId = req.userId;
    const { loadedChats, requestChats } = req.query;

    try
    {
        const chats = await ChatModel.find({
            $or: [
                { userId: userId },
                { "replies.userId": userId }
            ]
        })
        .populate("userId", "firstName lastName profilePicUrl")
        .skip(parseInt(loadedChats))
        .limit(parseInt(requestChats))

        if(chats){
            const chatDetails = chats.map(chat => ({
                chatId: chat._id,
                firstName: chat.userId.firstName,
                lastName: chat.userId.lastName,
                profilePicUrl: chat.userId.profilePicUrl,
                chatContent: chat.chatContent,
                replies: chat.replies,
                createdAt: chat.createdAt
            }))
            
            const hasMore = (await ChatModel.countDocuments({
                $or: [
                    { userId: userId },
                    { "replies.userId": userId }
                ]
            })) > parseInt(loadedChats) + chats.length
    
            res.status(200).json({
                chatDetails,
                hasMore
            })
        } else {
            res.status(404).json({
                msg: "chat not found"
            })
        }
    } catch (err) {
        res.status(500).json({
            msg: "Internal server error"
        });
    }
})

// when user wants to add new reply
chatRouter.post("/add-reply", userMiddleware, async function(req, res){
    const userId = req.userId;
    const chatId = req.body.chatId;
    const newReply = {
        replyContent: req.body.replyContent,
        userId: userId,
        createdAt: req.body.createdAt
    }

    try{
        const chat = await ChatModel.findOneAndUpdate({
            _id: chatId
        }, {
            $push: { replies: newReply }
        })

        if(!chat){
            return res.status(404).json({
                msg: "chat not found"
            })
        }

        res.status(200).json({
            msg: "reply added successfully"
        })
    } catch (err) {
        res.status(500).json({
            msg: "Internal server error"
        });
    }
})

module.exports = {
    chatRouter
}