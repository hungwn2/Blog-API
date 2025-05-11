const passport=require('passport');
const LocalStrategy=require('passport-local').Strategy;
const JwtStrategy=require('passport-jwt').Strategy;
const ExtractJwt=require('passport-jwt').ExtractJwt;
const bcrypt=require('bcryptjs');
const prisma=require('./database');
require('dotenv').config();

const opts={
    jwtFromRequest:ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey:process.env.JWT_SECRET||"secretKey",
};

passport.use(
    new LocalStrategy({
        usernameField:'username',
        passwordField:'password'
    },
async(username, password, done)=>{
    try{
        const user=await prisma.user.findUnique({
            where:{username}
        });
        if (!user||(await bcrypt.compare(password, user.password))){
            return done(null, false, {message:'Incorrect user/pass'});
        }

        const { password: _, ...userWithoutPassword } = user;
        return done(null, userWithoutPassword);
        
    }catch(error){
        return done(error);
    }
})
);

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,  // ✅ correct key
  };
  

passport.use(
    new JwtStrategy(jwtOptions, async(payload, done)=>{
        try{
            const user=await primsa.user.findUnique({
            where:{id:payload.sub}
        });
        if (!user){
            return done(null, false);
        }
        const {password:_, ...userWithoutPassord}=user;
        return done(null, userWithoutPassword);
    }catch(error){
        return done(error, false);
    }
})
);

module.exports=passport;