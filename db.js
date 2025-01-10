const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.ObjectId;

const userSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true},
    gender: { type: String, enum: ['male', 'female'], required: true },
    profilePicUrl: { type: String, required: true },
    profileBannerUrl: String,
    dateOfBirth: { type: Date, required: true },
    address: { type: String, required: true },
    whatsappNumber: { type: Number, required: true, unique: true },
    maritalStatus: { type: Boolean, required: true },
    openToMarriage: { type: Boolean, required: true },
    occupation: { type: String, enum: ['job', 'business', 'student', 'farmer', 'housewife'], required: true },
    jobRole: String,
    companyName: String,
    businessName: String,
    businessAddress: String,
    landArea: String,
    qualification: { type: String, required: true },
    collegeOrSchool: { type: String, required: true },
    fatherName: String,
    fatherPhoneNumber: String,
    aboutMe: String,
    facebookUrl: String, 
    instagramUrl: String,
    linkedinUrl: String,
    roleInSamaj: String,
    membershipId: { type: String, required: true },
    // idCardImageUrl: { type: String, required: true },
    myFriendList: { type: [Schema.Types.ObjectId], ref: 'User', default: []},
    isBlocked: Boolean,
    isModerator: Boolean
})

const replySchema = new Schema({
    replyContent: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    chatId: { type: Schema.Types.ObjectId, ref: 'Chat', required: true },
    createdAt: { type: Date, required: true }
})

const chatSchema = new Schema({
    chatContent: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, required: true },
    replies: [replySchema],
    isHidden: Boolean
})

const friendRequestSchema = new Schema({
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: {type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: String
})

const UserModel = mongoose.model('User', userSchema);
const ChatModel = mongoose.model('Chat', chatSchema);
const FriendRequestModel = mongoose.model('FriendRequest', friendRequestSchema);

module.exports = {
    UserModel,
    ChatModel,
    FriendRequestModel
}
