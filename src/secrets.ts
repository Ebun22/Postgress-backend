import dotenv from 'dotenv';

dotenv.config({path: '.env'});


export const PORT = process.env.PORT;
export const JWT_SECRET = process.env.JWT_SECRET!;
export const STRIPE_API_KEY = process.env.STRIPE_API_KEY!;
// export const GMAIL_PASSWORD = process.env.GMAIL_PASSWORD!;
// export const GMAIL_USER = process.env.GMAIL_USER!;
export const CLOUD_NAME = process.env.CLOUD_NAME;
export const API_KEY = process.env.API_KEY;
export const API_SECRET = process.env.API_SECRET;
// export const DATABASE_URL = process.env.NODE_ENV === "production" ? process.env.DATABASE_URL_PROD :  process.env.DATABASE_URL_DEV;
