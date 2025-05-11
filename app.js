const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport');
const path = require('path');
const bcrypt = require('bcryptjs');
const ejsLayouts = require('express-ejs-layouts');
require('dotenv').config();
require('./src/config/passport');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(); 

const authRoutes = require('./src/routes/auth');
const postRoutes = require('./src/routes/post');
const commentRoutes = require('./src/routes/comment');
const userRoutes = require('./src/routes/user');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(ejsLayouts);
app.set('layout', 'layout');

app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(passport.initialize());

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);


app.get('/', (req, res)=>{
    res.render('index', {title:'Home'});
});
app.get('/login', (req, res)=>{
    res.render('auth/login', {title:'Login'});
});
app.get('/signup', (req, res)=>{
    res.render('auth/register', {title:'Register'});
});

app.post('/signup', async (req, res, next) => {
    try {
      const { username, email, password, firstname, lastname } = req.body;
  
      // ✅ Check if the username or email already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { username: username },
            { email: email }
          ]
        }
      });
  
      if (existingUser) {
        return res.status(400).send('Username or email already in use.');
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          firstName: firstname,
          lastName: lastname
        }
      });
  
      res.redirect('/login');
    } catch (err) {
      next(err);
    }
  });
  


app.get('/posts', async(req, res, next)=>{
    try{
        const {PrismaClient}=require('@prisma/client');
        const prisma=new PrismaClient();
        const posts=await prisma.post.findMany({
            where:{published:true},
            include:{author:true}
        });
        res.render('posts/list', {title:'All posts', posts});
    }catch(err){
        next(err);
    }
});

app.get('/posts/:id', async (req, res, next) => {
    try {
      const post = await prisma.post.findUnique({
        where: {
          id: req.params.id // ✅ it's already a string
        },
        include: {
          author: true
        }
      });
  
      if (!post) return res.status(404).send('Post not found');
      res.render('posts/detail', { title: post.title, post });
    } catch (err) {
      next(err);
    }
  });
  
// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
