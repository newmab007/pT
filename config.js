import 'dotenv/config'

// Check if bot token is there or not
if(!process.env.BOT_TOKEN) {
    console.log("Please set the BOT_TOKEN environment variable.");
    process.exit(1);
}
// Check if bot token is there or not
if(!process.env.DB_URL) {
    console.log("Please set the DB_URL environment variable.");
    process.exit(1);
}

const ADMINS = process.env.ADMINS || ''
const BOT_TOKEN = process.env.BOT_TOKEN || ''
const DB_URL = process.env.DB_URL || ''
const WORKER_URL = process.env.WORKER_URL || ''
const API_KEY = process.env.API_KEY || '' // Generate any API Key and pass it when accessing the API.
const LIMIT = Number(process.env.LIMIT) // Maximum number of products can be added by a user at a time.
 
export { ADMINS, BOT_TOKEN, DB_URL, WORKER_URL, API_KEY, LIMIT }
