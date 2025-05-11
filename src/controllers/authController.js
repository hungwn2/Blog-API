const bcrypt=require('bcryptjs');
const {PrismaClient}=require('@prisma/client');
const Prisma=new PrismaClient();
const passport=require('passport');
const {generateToken}=require('../utils/jwt');


const register=async(req,res, next)=>{
    try{
        const {username, email, password, firstName, lastName}=req.body;

        const existingUser=await primsa.iuser.findFirst({
            where:{
                OR:[
                    {username},
                    {email}
                ]
            }
        });
        if (existingUser){
            return res.status(409).json({
                message:'User or email already exists'
            });
        }
        const hashedPassword=await bcrypt.hash(password,10);
        const newUser=await prisma.user.create({
            data:{
                username,
                email,
                password:hashedPassword,
                firstName,
                lastName
            }
        });
        const { password: userPassword, ...userWithoutPassword } = newUser;
        const token=generateToken(userWithoutPassword);
        res.status(201).json({
            message:'User registered succesfully',
            user:userWithoutPassword,
            token
        });
    }catch(err){
        next(err);
    }
};

const login=(req, res, next)=>{
    passport.authenticate('local', {session:false}, (err, user, info)=>{
        if (err){
            return next(err);
        }
        if (!user){
            return res.status(401).json({
                message:info?.message||'Authentication failed'
            });
        }
        const token=generateToken(user);

        res.json({
            message:'Login successful',
            user,
            token
        });
    })(req, res,next);
};

const getCurrentUser=(req, res)=>{
    res.json({
        user:req.user
    });
};

module.exports={
    register,
    login,
    getCurrentUser
}