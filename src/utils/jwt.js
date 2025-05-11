const jwt=require("jsonwebtoken");

const generateToken=(user)=>{
    const payload={
        sub:user.id,
        usernmae:user.username,
        isAdmin:user.isAdmin,
        iat:Math.floor(Date.now()/1000),
        exp:Math.floor(Date.now()/1000)+(60*60*24)
    };
    return jwt.sign(payload, process.env.JWT_SECRET);
}

const verifyToken=(token)=>{
    try{
        return jwt.verify(token, process.env.JWT_SECRET);
    }catch(err){
        return null;
    }
};

module.exports={
    generateToken,
    verifyToken
};