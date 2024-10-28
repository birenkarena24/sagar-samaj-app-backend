require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const { userRouter } = require("./routes/users");
const { chatRouter } = require("./routes/chats");
const { requestRouter } = require("./routes/friend_request");
const { moderatorRouter } = require("./routes/moderator_action");
const { listRouter } = require("./routes/all_list");

const app = express();

app.use(express.json());

app.use("/user", userRouter);
app.use("/chat", chatRouter);
app.use("/user/friend-request", requestRouter);
app.use("/moderator", moderatorRouter);
app.use("/list", listRouter);

async function main(){
    await mongoose.connect(process.env.MONGODB_URL);
    app.listen(3000)
}

main();