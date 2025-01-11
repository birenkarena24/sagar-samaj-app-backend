const { Router } = require("express");
const { UserModel, ChatModel } = require("../db");
const { userMiddleware } = require("../middleware/user");

const listRouter = Router();

// all list of chats
listRouter.get("/all-chat", userMiddleware, async function(req, res){
    const { loadedChats, requestChats } = req.query;
    
    try{
        const chats = await ChatModel.find({
            isHidden: false
        })
        .populate("userId replies.userId", "firstName lastName profilePicUrl")
        .skip(parseInt(loadedChats))
        .limit(parseInt(requestChats))

        const chatDetails = chats.map(chat => ({
            chatId: chat._id,
            userName: chat.userId.firstName + " " + chat.userId.lastName,
            profilePicUrl: chat.userId.profilePicUrl,
            chatContent: chat.chatContent,
            createdAt: chat.createdAt,
            reply1Id: chat.replies[chat.replies.length - 1] ? chat.replies[chat.replies.length - 1]._id : null,
            reply1Content: chat.replies[chat.replies.length - 1] ? chat.replies[chat.replies.length - 1].replyContent : null,
            reply1UserName: chat.replies[chat.replies.length - 1] ? (chat.replies[chat.replies.length - 1].userId.firstName) + " " + (chat.replies[chat.replies.length - 1].userId.lastName) : null,
            reply1UserPic: chat.replies[chat.replies.length - 1] ? (chat.replies[chat.replies.length - 1].userId.profilePicUrl) : null,
            reply1time: chat.replies[chat.replies.length - 1] ? chat.replies[chat.replies.length - 1].createdAt : null,
            reply2Id: chat.replies[chat.replies.length - 2] ? chat.replies[chat.replies.length - 2]._id : null,
            reply2Content: chat.replies[chat.replies.length - 2] ? chat.replies[chat.replies.length - 2].replyContent : null,
            reply2UserName: chat.replies[chat.replies.length - 2] ? (chat.replies[chat.replies.length - 2].userId.firstName) + " " + (chat.replies[chat.replies.length - 1].userId.lastName) : null,
            reply2UserPic: chat.replies[chat.replies.length - 2] ? (chat.replies[chat.replies.length - 2].userId.profilePicUrl) : null,
            reply2time: chat.replies[chat.replies.length - 2] ? chat.replies[chat.replies.length - 2].createdAt : null
        }))

        const hasMore = (await ChatModel.countDocuments({
            isHidden: false
        })) > parseInt(loadedChats) + chats.length

        res.status(200).json({
            chatDetails,
            hasMore
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            msg: "internal server error"
        })
    }
})

// all list of boys of matrimony
listRouter.get("/matrimony-boys", userMiddleware, async function(req, res){
    const { loadedUsers, requestUsers } = req.query;
    
    try{
        const boys = await UserModel.find({
            gender: "male",
            openToMarriage: true,
            isBlocked: false
        })
        .skip(parseInt(loadedUsers))
        .limit(parseInt(requestUsers))

        const boysList = boys.map(({_id, firstName, lastName, profilePicUrl, dateOfBirth, address, occupation, jobRole, businessName, qualification}) => ({
            _id,
            firstName,
            lastName,
            profilePicUrl,
            dateOfBirth,
            address,
            occupation,
            jobRole,
            businessName,
            qualification
        }))

        const hasMore = (await UserModel.countDocuments({
            gender: "male",
            openToMarriage: true,
            isBlocked: false
        })) > parseInt(loadedUsers) + boys.length
        
        res.status(200).json({
            boysList,
            hasMore,
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            msg: "internal server error"
        })
    }
})

// all list of girls of matrimony
listRouter.get("/matrimony-girls", async function(req, res){
    const { loadedUsers, requestUsers } = req.query;
    
    try{
        const girls = await UserModel.find({
            gender: "female",
            openToMarriage: true,
            isBlocked: false
        })
        .skip(parseInt(loadedUsers))
        .limit(parseInt(requestUsers))

        const girlsList = girls.map(({_id, firstName, lastName, profilePicUrl, dateOfBirth, address, occupation, jobRole, qualification}) => ({
            _id,
            firstName,
            lastName,
            profilePicUrl,
            dateOfBirth,
            address,
            occupation,
            jobRole,
            qualification
        }))

        const hasMore = (await UserModel.countDocuments({
            gender: "female",
            openToMarriage: true,
            isBlocked: false
        })) > parseInt(loadedUsers) + girls.length
        
        res.status(200).json({
            girlsList,
            hasMore,
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            msg: "internal server error"
        })
    }
})

// all list of members of community
listRouter.get("/all-members", async function(req, res){
    const { loadedUsers, requestUsers } = req.query;

    try {
        const members = await UserModel.find({
            isBlocked: false
        })
        .skip(parseInt(loadedUsers))
        .limit(parseInt(requestUsers))
        
        const membersList = members.map(({_id, firstName, lastName, profilePicUrl, address, occupation, jobRole, businessName, qualification, roleInSamaj}) => ({
            _id,
            firstName,
            lastName,
            profilePicUrl,
            address,
            occupation,
            jobRole,
            businessName,
            qualification,
            roleInSamaj
        }))
        
        const hasMore = (await UserModel.countDocuments({
            isBlocked: false
        })) > parseInt(loadedUsers) + members.length
        
        res.status(200).json({
            membersList,
            hasMore,
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            msg: "internal server error"
        })
    }
})

module.exports = {
    listRouter
}