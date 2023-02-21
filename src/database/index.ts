import mongoose from "mongoose";

import dotenv from "dotenv"
dotenv.config()

async function connectDb() {
    const dbUrl = process.env.DB_URL || ''
    mongoose.set("strictQuery", true)
    mongoose.set("strict", true)
    mongoose.connect(dbUrl)
    const db = mongoose.connection;
    db.on("error", console.error.bind(console, "connection error:"));
    db.once("open", function () {
        console.log("Connected to MongoDB");
    });

}

export default connectDb