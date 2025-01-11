const { Router } = require("express");
const { UserModel, FriendRequestModel } = require("../db");
const { userMiddleware } = require("../middleware/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_USER_SECRET } = require("../config");
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const userRouter = Router();

let memberId = 100

// when user creates an account
userRouter.post("/signup", async function(req, res){
    const hashedPassword = await bcrypt.hash(req.body.password, 7);
    
    try{
        const user = await UserModel.create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            phoneNumber: req.body.phoneNumber,
            password: hashedPassword,
            gender: req.body.gender,
            profilePicUrl: req.body.profilePicUrl,
            profileBannerUrl: req.body.profileBannerUrl,
            dateOfBirth: req.body.dateOfBirth,
            address: req.body.address,
            whatsappNumber: req.body.whatsappNumber,
            maritalStatus: req.body.maritalStatus,
            openToMarriage: req.body.openToMarriage,
            occupation: req.body.occupation,
            jobRole: req.body.jobRole,
            companyName: req.body.companyName,
            businessName: req.body.businessName,
            businessAddress: req.body.businessAddress,
            landArea: req.body.landArea,
            qualification: req.body.qualification,
            collegeOrSchool: req.body.collegeOrSchool,
            fatherName: req.body.fatherName,
            fatherPhoneNumber: req.body.fatherPhoneNumber,
            aboutMe: req.body.aboutMe,
            facebookUrl: req.body.facebookUrl,
            instagramUrl: req.body.instagramUrl,
            linkedinUrl: req.body.linkedinUrl,
            roleInSamaj: req.body.roleInSamaj,
            membershipId: "SSM" + memberId,
            isBlocked: false,
            isModerator: false    
        })

        const token = jwt.sign({
            id: user._id.toString()
        }, JWT_USER_SECRET);

        res.status(200).json({
            msg: "you are signed up",
            membershipId: user.membershipId,
            token
        })

        memberId = memberId + 1      
 
    } catch (err) {   
        console.log(err)     
        if (err.code === 11000) {
            res.status(400).json({
                msg: "duplicate entry"
            });
        } else {
            res.status(500).json({
                msg: "Internal server error"
            });
        }
    }
})

// when user signin 
userRouter.post("/signin", async function(req, res){
    const { phoneNumber, password } = req.body;

    try{
        const user = await UserModel.findOne({
            phoneNumber: phoneNumber
        })

        if(!user){
            return res.status(403).json({
                msg: "user not found"
            })
        }

        const matchedPassword = await bcrypt.compare(password, user.password);

        if(matchedPassword){
            const token = jwt.sign({
                id: user._id.toString()
            }, JWT_USER_SECRET);

            res.json({
                token: token,
                membershipId: user.membershipId,
                isBlocked: user.isBlocked
            })
        } else {
            res.status(403).json({
                msg: "incorrect password"
            })
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({
            msg: "internal server error"
        })
    }
})

// when user forgot the password
userRouter.put("/forgot-password", async function(req, res){
    const phoneNumber = req.body.phoneNumber;
    const hashedPassword = await bcrypt.hash(req.body.password, 7);

    try{
        const user = await UserModel.findOneAndUpdate({
            phoneNumber: phoneNumber 
        }, {
            password: hashedPassword
        })

        if(!user){
            return res.status(404).json({
                msg: "user not found"
            })
        }

        res.status(200).json({
            msg: "password updated successfully"
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            msg: "internal server error"
        })
    }
})

// when user wants to edit his profile
userRouter.put("/edit-profile", userMiddleware, async function(req, res){
    const userId = req.userId;
    console.log("userId : ",userId);
    
    try{
        const user = await UserModel.findOneAndUpdate({
            membershipId: userId
        }, {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            gender: req.body.gender,
            profilePicUrl: req.body.profilePicUrl,
            profileBannerUrl: req.body.profileBannerUrl,
            dateOfBirth: req.body.dateOfBirth,
            address: req.body.address,
            whatsappNumber: req.body.whatsappNumber,
            maritalStatus: req.body.maritalStatus,
            openToMarriage: req.body.openToMarriage,
            occupation: req.body.occupation,
            jobRole: req.body.jobRole,
            companyName: req.body.companyName,
            businessName: req.body.businessName,
            businessAddress: req.body.businessAddress,
            landArea: req.body.landArea,
            qualification: req.body.qualification,
            collegeOrSchool: req.body.collegeOrSchool,
            fatherName: req.body.fatherName,
            fatherPhoneNumber: req.body.fatherPhoneNumber,
            aboutMe: req.body.aboutMe,
            facebookUrl: req.body.facebookUrl,
            instagramUrl: req.body.instagramUrl,
            linkedinUrl: req.body.linkedinUrl,
            roleInSamaj: req.body.roleInSamaj,
        })

        if(!user){
            return res.status(404).json({
                msg: "user not found"
            })
        }

        res.status(200).json({
            msg: "profile updated successfully"
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            msg: "internal server error"
        })
    }
})

// when user wants to see his profile or other user's profile details
userRouter.get("/profile-details", userMiddleware, async function(req, res){
    const userId = req.userId;
    const otherUserId = req.headers.userid;

    try{
        const user = await UserModel.findOne({
            membershipId: otherUserId
        })
        // console.log("user : ",user);
        
        if(user){
            const {
                firstName,
                lastName,
                phoneNumber,
                gender,
                profilePicUrl,
                profileBannerUrl,
                dateOfBirth,
                address,
                whatsappNumber,
                maritalStatus,
                occupation,
                jobRole,
                companyName,
                businessName,
                businessAddress,
                landArea,
                qualification,
                collegeOrSchool,
                fatherName,
                fatherPhoneNumber,
                aboutMe,
                facebookUrl,
                instagramUrl,
                linkedinUrl,
                roleInSamaj,
                myFriendList,
                isBlocked
            } = user

            const isFriend = myFriendList.some(friendId => friendId.equals(new ObjectId(user._id)))

            let friendRequestSent = false

            // const friendRequest = await FriendRequestModel.findOne({
            //     senderId: userId,     
            //     receiverId: otherUserId
            // })

            // if(friendRequest){
                friendRequestSent = true
            // }

            if(!isBlocked){
                return res.status(200).json({
                    firstName,
                    lastName,
                    phoneNumber,
                    gender,
                    profilePicUrl,
                    profileBannerUrl,
                    dateOfBirth,
                    address,
                    whatsappNumber,
                    maritalStatus,
                    occupation,
                    jobRole,
                    companyName,
                    businessName,
                    businessAddress,
                    landArea,
                    qualification,
                    collegeOrSchool,
                    fatherName,
                    fatherPhoneNumber,
                    aboutMe,
                    facebookUrl,
                    instagramUrl,
                    linkedinUrl,
                    roleInSamaj,
                    isFriend,
                    friendRequestSent
                })
            } else {
                return res.status(403).json({
                    msg: "you don't have access to see this user"
                })
            }
        } else {
            return res.status(404).json({
                msg: "user not found"
            })
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            msg: "internal server error"
        })
    }
})

// when user wants to see his friends
userRouter.get("/my-friends", userMiddleware, async function(req, res){
    const userId = req.userId;
    const { loadedFriends, requestFriends } = req.query;
    
    try{
        const user = await UserModel.findOne({
            _id: userId
        })
        .populate("myFriendList", "_id firstName lastName profilePicUrl address occupation jobRole businessName qualification roleInSamaj")

        if(user){
            const friends = user.myFriendList.slice(parseInt(loadedFriends), parseInt(loadedFriends) + parseInt(requestFriends))
            
            const hasMore = user.myFriendList.length > (parseInt(loadedFriends) + friends.length)

            return res.status(200).json({
                friends,
                hasMore
            });
        } else {
            return res.status(404).json({
                msg: "user not found"
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
    userRouter
}