# 📰 Blog API

RESTful API for a blog platform, part of **The Odin Project**. Built with **Node.js**, **Express**, **PostgreSQL**, **Prisma ORM**, **JWT**, and **Passport.js**.

## ✨ Features

- User registration & login with password hashing via `bcrypt`  
- JWT-based authentication  
- Prisma schema for type-safe database access  
- PostgreSQL for data storage  
- Organized REST API structure with modular routing  

> Inspired by the project: [Members Only](https://members-only-odin.onrender.com)

---

## 🚀 To Use

### 📁 Clone the repository

git clone https://github.com/hungwn2/Blog-App.git
cd Blog-App

### 📦 Install dependencies
npm install

### ⚙️ Create and configure .env file

DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<database>"
JWT_SECRET="your_jwt_secret"
PORT=3000
Replace the placeholder values with your actual PostgreSQL credentials.

### 🛠️ Set up the database

npx prisma migrate dev --name init
npx prisma generate

### ▶️ Start the server
npm run dev
The server will be running at:
🌐 http://localhost:3000
