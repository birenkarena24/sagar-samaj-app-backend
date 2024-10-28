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

    try
    {
        const chat = await ChatModel.find({
            $or: [
                { userId: userId },
                { "replies.userId": userId }
            ]
        })

        if(chat){
            res.status(200).json(chat)
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