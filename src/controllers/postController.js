const prisma=require('../config/database');

const getAllPosts=async(req, res, next)=>{
    try{
        const {page=1, limit=10, title, published}=req.query;
        const parsedPage=parseInt(page);
        const parsedLimit=parseInt(limit);
        const where={};

        if (title){
            where.title = {
                contains: title,
                mode: 'insensitive',
            };
        }
        if (!req.user?.isAdmin){
            where.published=true;
        }else if (published!==undefined){
            where.published=published=='true';
        }
        const posts=await prisma.post.findMany({
            where,
            include:{
                author:{
                    select:{
                        id:true,
                        username:true,
                        firstName:true,
                        lastName:true
                    }
                },
                _count:{
                    select: {comments:true}
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip:(parsedPage-1)*parseLimit,
            take:parsedLimit
        });
        const totalPosts=await prisma.post.count({where});

        res.json({
            data:posts,
            meta:{
                total:totalPosts,
                page:parsedPage,
                limit:parsedLimit,
                totalPages:Math.ceil(totalPosts/parsedLimit),
            }
        });
    }catch(err){
        next(err);
    }
};


const getPostById = async (req, res, next) => {
    try {
      const { id } = req.params;
      
      const post = await prisma.post.findUnique({
        where: { id },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true
            }
          },
          comments: {
            include: {
              author: {
                select: {
                  id: true,
                  username: true
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      });
      
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      
      // If post is not published and user is not admin or author, return 404
      if (!post.published && !req.user?.isAdmin && post.authorId !== req.user?.id) {
        return res.status(404).json({ message: 'Post not found' });
      }
      
      res.json(post);
    } catch (error) {
      next(error);
    }
  };
  

  const createPost = async (req, res, next) => {
    try {
      const { title, content, published = false } = req.body;
      
      const newPost = await prisma.post.create({
        data: {
          title,
          content,
          published,
          authorId: req.user.id
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });
      
      res.status(201).json(newPost);
    } catch (error) {
      next(error);
    }
  };

  const updatePost = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { title, content, published } = req.body;
      
      // Check if post exists
      const existingPost = await prisma.post.findUnique({
        where: { id }
      });
      
      if (!existingPost) {
        return res.status(404).json({ message: 'Post not found' });
      }
      
      // Check if user is author or admin
      if (existingPost.authorId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: 'Forbidden: You can only update your own posts' });
      }
      
      // Update post
      const updatedPost = await prisma.post.update({
        where: { id },
        data: {
          title,
          content,
          published,
          updatedAt: new Date()
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });
      
      res.json(updatedPost);
    } catch (error) {
      next(error);
    }
  };

  const deletePost = async (req, res, next) => {
    try {
      const { id } = req.params;
      
      // Check if post exists
      const existingPost = await prisma.post.findUnique({
        where: { id }
      });
      
      if (!existingPost) {
        return res.status(404).json({ message: 'Post not found' });
      }
      
      // Check if user is author or admin
      if (existingPost.authorId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: 'Forbidden: You can only delete your own posts' });
      }
      
      // Delete post
      await prisma.post.delete({
        where: { id }
      });
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  const getPostsByAuthor = async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const parsedPage = parseInt(page);
      const parsedLimit = parseInt(limit);
      
      // Build where clause
      const where = { authorId: userId };
      
      // Regular users can only see published posts, admins can see all
      if (!req.user?.isAdmin && req.user?.id !== userId) {
        where.published = true;
      }
      
      // Get posts with pagination
      const posts = await prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true
            }
          },
          _count: {
            select: { comments: true }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (parsedPage - 1) * parsedLimit,
        take: parsedLimit
      });
      const totalPosts = await prisma.post.count({ where });
    
    res.json({
      data: posts,
      meta: {
        total: totalPosts,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(totalPosts / parsedLimit)
      }
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
    getAllPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    getPostsByAuthor
  };