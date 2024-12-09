import dotenv from 'dotenv';

dotenv.config({path: '.env'});

if(process.env.NODE_ENV === "development"){
    process.env.DATABASE_URL = process.env.DATABASE_URL_DEV
}else if(process.env.NODE_ENV === "production"){
    process.env.DATABASE_URL = process.env.DATABASE_URL_PROD
}

export const PORT = process.env.PORT;
export const JWT_SECRET = process.env.JWT_SECRET!;
export const CLOUD_NAME = process.env.CLOUD_NAME;
export const API_KEY = process.env.API_KEY;
export const API_SECRET = process.env.API_SECRET;
export const DATABASE_URL = process.env.NODE_ENV === "production" ? process.env.DATABASE_URL_PROD :  process.env.DATABASE_URL_DEV;