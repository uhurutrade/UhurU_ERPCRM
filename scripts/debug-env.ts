
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

console.log("Checking .env file...");
console.log("AUTH_GOOGLE_ID exists:", !!process.env.AUTH_GOOGLE_ID);
console.log("AUTH_GOOGLE_ID length:", process.env.AUTH_GOOGLE_ID?.length || 0);
console.log("AUTH_GOOGLE_SECRET exists:", !!process.env.AUTH_GOOGLE_SECRET);
if (!process.env.AUTH_GOOGLE_ID) console.warn("WARNING: AUTH_GOOGLE_ID is missing in .env!");
