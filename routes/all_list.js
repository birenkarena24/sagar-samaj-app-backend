const { Router } = require("express");
const { UserModel, ChatModel } = require("../db");
const { userMiddleware } = require("../middleware/user");

const listRouter = Router();

// all list of chats
listRouter.get("/all-chat", userMiddleware, async function(req, res){
    const { loadedChats, requestChats } = req.body;
    
    try{
        const chats = await ChatModel.find({
            isHidden: false
        })
        .skip(parseInt(loadedChats))
        .limit(parseInt(requestChats))

        const hasMore = (await ChatModel.countDocuments({
            isHidden: false
        })) > parseInt(loadedChats) + chats.length

        res.status(200).json({
            chats,
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
    const { loadedUsers, requestUsers } = req.body;
    
    try{
        const boys = await UserModel.find({
            gender: "male",
            openToMarriage: true,
            isBlocked: false
        })
        .skip(parseInt(loadedUsers))
        .limit(parseInt(requestUsers))

        const boysList = boys.map(({firstName, lastName, profilePicUrl, dateOfBirth, address, occupation, jobRole, businessName, qualification}) => ({
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
    const { loadedUsers, requestUsers } = req.body;
    
    try{
        const girls = await UserModel.find({
            gender: "female",
            openToMarriage: true,
            isBlocked: false
        })
        .skip(parseInt(loadedUsers))
        .limit(parseInt(requestUsers))

        const girlsList = girls.map(({firstName, lastName, profilePicUrl, dateOfBirth, address, occupation, jobRole, qualification}) => ({
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
    const { loadedUsers, requestUsers } = req.body;

    try {
        const members = await UserModel.find({
            isBlocked: false
        })
        .skip(parseInt(loadedUsers))
        .limit(parseInt(requestUsers))
        
        const membersList = members.map(({firstName, lastName, profilePicUrl, address, occupation, jobRole, businessName, qualification, roleInSamaj}) => ({
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