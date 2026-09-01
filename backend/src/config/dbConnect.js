import mongoose from "mongoose";
import dotenv from "dotenv/config"

const url = process.env.URL

export async function dbConnect() {
    try {
        await mongoose.connect(url)
        console.log(`DB running successfully`)
    } catch (error) {
        console.log(`DB connection error ${error}`)
    }
}
