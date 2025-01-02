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
        console.log(err)
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
        console.log(err)
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
        console.log(err)
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
        console.log(err)
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
        chatId: chatId,
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
        console.log(err)
        res.status(500).json({
            msg: "Internal server error"
        });
    }
})

// chat-replies detailed view page (when user wants to see more replies & user opens a sharable link of post
chatRouter.get("/", userMiddleware, async function(req, res){
    const { chatId, loadedReplies, requestReplies } = req.query

    try {
        const chat = await ChatModel.findOne({
            _id: chatId,
            isHidden: false
        })
        .populate("userId replies.userId", "firstName lastName profilePicUrl")

        if(chat){
            const chatDetails = {
                chatId: chat._id,
                userName: chat.userId.firstName + " " + chat.userId.lastName,
                profilePicUrl: chat.userId.profilePicUrl,
                chatContent: chat.chatContent,
                createdAt: chat.createdAt,
            }
            
            const replies = chat.replies.reverse().slice(parseInt(loadedReplies), parseInt(loadedReplies) + parseInt(requestReplies))
        
            const replyDetails = replies.map(reply => ({
                replyId: reply._id,
                replyContent: reply.replyContent,
                userName: reply.userId.firstName + " " + reply.userId.lastName,
                userPic: reply.userId.profilePicUrl,
                replyTime: reply.createdAt
            }))

            const hasMore = chat.replies.length > parseInt(loadedReplies) + replies.length

            return res.status(200).json({
                chatDetails,
                replyDetails,
                hasMore
            })
        } else {
            return res.status(404).json({
                msg: "chat not found"
            })
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({
            msg: "internal server error"
        })
    }
})

module.exports = {
    chatRouter
}