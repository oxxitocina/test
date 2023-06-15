import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'

export default function createServer() {
    const app = express();
    app.use(express.json())
    const DB_URL = 'mongodb+srv://user:user@cluster0.xebnxp7.mongodb.net/'

    app.use(cors({
        origin: ['http://localhost:1234', 'http://localhost:5000','http://localhost:3000',]
    }))

    return app;
}