const jwt = require("jsonwebtoken");
const { JWT_USER_SECRET } = require("../config");

function userMiddleware(req, res, next){
    const token = req.headers.token;

    if(!token){
        return res.status(401).json({
            msg: "no token provided, you are not signed in"
        })
    }

    try{
        const decodedUser = jwt.verify(token, JWT_USER_SECRET);

        req.userId = decodedUser.id;
        
        next();
    } catch (err) {    
        return res.status(401).json({
            msg: "Invalid or expired token, you are not signed in"
        })
    }
}

module.exports = {
    userMiddleware
}