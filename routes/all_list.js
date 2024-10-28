const { Router } = require("express");
const { UserModel, ChatModel } = require("../db");
const { userMiddleware } = require("../middleware/user");

const listRouter = Router();

// all list of chats
listRouter.get("/all-chat", userMiddleware, async function(req, res){
    try{
        const chats = await ChatModel.find({
            isHidden: false
        })

        res.status(200).json(chats)
    } catch (err) {
        res.status(500).json({
            msg: "internal server error"
        })
    }
})

// all list of boys of matrimony
listRouter.get("/matrimony-boys", userMiddleware, async function(req, res){
    try{
        const boys = await UserModel.find({
            gender: "male",
            openToMarriage: true,
            isBlocked: false
        })

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

        res.status(200).json(boysList)
    } catch (err) {
        console.log(err)
        res.status(500).json({
            msg: "internal server error"
        })
    }
})

// all list of girls of matrimony
listRouter.get("/matrimony-girls", async function(req, res){
    try{
        const girls = await UserModel.find({
            gender: "female",
            openToMarriage: true,
            isBlocked: false
        })

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

        res.status(200).json(girlsList)
    } catch (err) {
        console.log(err)
        res.status(500).json({
            msg: "internal server error"
        })
    }
})

// all list of members of community
listRouter.get("/all-members", async function(req, res){
    try{
        const members = await UserModel.find({
            isBlocked: false
        })

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

        res.status(200).json(membersList)
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