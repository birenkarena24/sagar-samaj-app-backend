const jwt = require("jsonwebtoken");
const { JWT_USER_SECRET } = require("../config");
const { UserModel } = require("../db");

async function moderatorMiddleware(req, res, next){
    const token = req.headers.token;

    if(!token){
        return res.status(401).json({
            msg: "no token provided, you are not signed in"
        })
    }

    try
    {
        const decodedUser = jwt.verify(token, JWT_USER_SECRET);

        const moderator = await UserModel.findOne({
            _id: decodedUser.id,
            isModerator: true
        })

        if(moderator){
            req.moderatorId = decodedUser.id;
            
            next();
        } else {
            return res.status(403).json({
                msg: "you are not a moderator"
            })
        }
    } catch (err) {    
        return res.status(401).json({
            msg: "Invalid or expired token, you are not signed in"
        })
    }
}

module.exports = {
    moderatorMiddleware
}