const { Router } = require("express");
const { UserModel, ChatModel } = require("../db");
const { moderatorMiddleware } = require("../middleware/moderator");

const moderatorRouter = Router();

// when moderator delete any chat
moderatorRouter.delete("/delete-chat", moderatorMiddleware, async function(req, res){
    const chatId = req.body.chatId;

    try
    {
        const chat = await ChatModel.findOneAndDelete({
            _id: chatId
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

// when moderator block any user
moderatorRouter.delete("/block-user", moderatorMiddleware, async function(req, res){
    const membershipId = req.body.membershipId;

    try{
        const user = await UserModel.findOneAndUpdate({
            membershipId: membershipId 
        }, {
            isBlocked: true
        })

        if(!user){
            return res.status(404).json({
                msg: "user not found"
            })
        }

        res.status(200).json({
            msg: "user profile status updated successfully"
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            msg: "internal server error"
        })
    }
})

module.exports = {
    moderatorRouter
}