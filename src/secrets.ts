import dotenv from 'dotenv';

dotenv.config({path: '.env'});

export const PORT = process.env.PORT;
export const JWT_SECRET = process.env.JWT_SECRET!;
export const CLOUD_NAME = process.env.CLOUD_NAME;
export const API_KEY = process.env.API_KEY;
export const API_SECRET = process.env.API_SECRET;