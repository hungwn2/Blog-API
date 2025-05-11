const passport=require('passport');

//auth middlewares
const authenticate=(req, res, next)=>{
    passport.authenticate('jwt', {session:false}, (err, user, info)=>{
        if (err){
            return next(err);
        }
        if (!user){
            return res.status(401).json({message:'Authentication required'});
        }
        req.user=user;
        next();
    })(req, res, next);
};

const requireAdmin=(req, res, next)=>{
    if (!req.user||!req.user.isAdmin){
        return res.status(403).json({message:'Forbidden'});
    }
    next();
}

const isAuthorOrAdmin=(resourceType)=> async(req, res, next)=>{
    try{
        const {id}=req.params;
        const userId=req.user.id;
        const isAdmin=req.user.isAdmin;
        if (isAdmin){
            return next();
        }
        let resource;
        if (resourceType==='post'){
            resource=await primsa.post.findUnique({
                where:{id}
            });
        }else if (resourceType==='comment'){
            resource=await primsa.comment.findUnique({
                where:{id}
            });
        }else{
            return res.status(500).json({message:'Invalid resource type'});
        }
        if (!resource){
            return res.status(404).json({message:`{resourceType} not found`});
        }

        if (resource.authorId!==userId){
            return res.status(403).json({message:'Forbidden'});
        }
        next();
    }catch(err){
        next(err);
    }
};

module.exports={
    authenticate,
    requireAdmin,
    isAuthorOrAdmin
};