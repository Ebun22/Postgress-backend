import { PrismaClient } from '@prisma/client'
import express, { Express, Request, Response } from 'express';
import rootRouter from './routes';
import { PORT } from './secrets.ts';
import { errorMiddleware } from './middlewares/errors.ts';
import dotenv from 'dotenv';
import cors from 'cors'

dotenv.config({path: '.env'});

export const DATABASE_URL = process.env.NODE_ENV === "production" ? process.env.DATABASE_URL_PROD :  process.env.DATABASE_URL_DEV;

export const prisma = new PrismaClient().$extends({
  result: {
    shippingAddress: {
      formattedAddress: {
        needs: {
          roomNo: true,
          buildingName: true,
          street: true,
          area: true,
          landmark: true,
        },
        compute: (addr) => {
          return `${addr.roomNo} ${addr.buildingName}, ${addr.street}, ${addr.roomNo}, ${addr.landmark}`
        }
      }
    }
  }
});

const app: Express = express()

app.use(cors())

app.disable('x-powered-by')
app.use(express.json());

app.use('/api', rootRouter);
app.use(errorMiddleware);
app.listen(PORT, () => console.log("App working!"))

//prisma
async function main() {
  // const allUsers = await prisma.user.findMany()
  // console.log(allUsers)
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