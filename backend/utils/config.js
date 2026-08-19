import dotenv from "dotenv";

dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET;
export const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
export const MONGO_URI = process.env.MONGO_URI;
export const SENDER_EMAIL_ADDRESS = process.env.SENDER_EMAIL_ADDRESS;
export const BREVO_API_KEY = process.env.BREVO_API_KEY;
export const BASE_URL_FOR_EMAIL = process.env.BASE_URL_FOR_EMAIL;
