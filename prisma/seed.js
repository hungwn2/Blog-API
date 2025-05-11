const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


async function main(){
    const user=await prisma.user.create({
        data:{
            username:'john',
            email:'himynameisjon123',
            password:'thisismypassword',
            firstName:'John',
            lastName:'Doe',
            bio:'Test User',
            isAdmin: true,
        },
    });

    const post=await prisma.post.create({
        data:{
            title:'Hello world',
            content:'This is my first post hi',
            published:true,
            authorId:user.id,
        },
    });

    await prisma.comment.create({
        data:{
            content:'Hi',
            postId:post.id,
            authorId:user.id,
        },
    });
    console.log('Seeded data');
}

main()
    .catch(e=>{
        console.error(e);
        process.exit(1);
    })
    .finally(async()=>{
        await prisma.$disconnect();
    });