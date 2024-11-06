import { PrismaClient } from '@prisma/client'
import express, {Express, Request, Response } from 'express';
import rootRouter from './routes';
import { PORT } from './secrets.ts';

export const prisma = new PrismaClient();

const app: Express = express();

app.use(express.json());

app.use('/api', rootRouter);

app.listen(PORT, () => console.log("App working!"))


//prisma
async function main() {
    // await prisma.user.create({
    //     data: {
    //         name: 'JaneDoe',
    //         email: 'janeDoe@prisma.com',
    //     }
    // })
    const allUsers = await prisma.user.findMany()
    console.log(allUsers)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })