import { PrismaClient } from '@prisma/client'
import express, { Express, Request, Response } from 'express';
import rootRouter from './routes';
import { PORT } from './secrets.ts';
import { errorMiddleware } from './middlewares/errors.ts';
import { softDelete, softDeleteMany } from './extensions/prisma.extentions.ts';


export const rawPrisma = new PrismaClient();
export const extendedPrisma = new PrismaClient().$extends(softDelete).$extends(softDeleteMany);

const app: Express = express();

app.use(express.json());

app.use('/api', rootRouter);
app.use(errorMiddleware);
app.listen(PORT, () => console.log("App working!"))


//prisma
async function main() {

  const allUsers = await rawPrisma.user.findMany()
  console.log(allUsers)
}

main()
  .then(async () => {
    await rawPrisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await rawPrisma.$disconnect()
    process.exit(1)
  })