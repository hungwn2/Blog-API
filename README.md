RestFul API for a blog Platform, part of the Odin Project, built with Node.js , Express, Psql, Prism ORM, JWT, and Passport.js.

-User registration & login with password hashing via bcrypt

-JWT-based authentication 


Prisma schema for type-safe database access

PostgreSQL for  data storage

Organized REST API structure with modular routing


*Trying to get it to look like one of my other projects here: https://members-only-odin.onrender.com


To use:

#Clone the repository

git clone https://github.com/hungwn2/Blog-App.git
cd Blog-App

#Install dependencies

npm install
#Create and configure .env file
DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<database>"
JWT_SECRET="your_jwt_secret"
PORT=3000

#Set up the database
npx prisma migrate dev --name init
npx prisma generate

#Start the server
npm run dev
The server should be running at http://localhost:3000.
