import express from 'express'
import cors from 'cors'
import amqp from 'amqplib/callback_api.js'
import protobuf from 'protobufjs'
import mongoose from 'mongoose'
import Post from "./post.js";
import MovieData from './movieData.js'

const PORT = 8000;
const DB_URL = 'mongodb+srv://user:user@cluster0.4b9gqtt.mongodb.net/'
const app = express();

app.use(express.json())
app.use(cors({
    origin: ['http://localhost:1234', 'http://localhost:5000','http://localhost:3000',]
}))

export async function startApp()   {
    try {
        const root = await protobuf.load('movieId.proto')
        const MovieIdProto = root.lookupType('movieidpackage.MovieId')

        amqp.connect('amqps://bzecpdsx:ohp1UJe_qnSflyW65NGAPiqTKhoDQoxY@hawk.rmq.cloudamqp.com/bzecpdsx', (error0, connection) => {
            if(error0) {
                throw error0
            }

            connection.createChannel((error1, channel) => {
                if(error1) {
                    throw error1
                }

                mongoose.connect(DB_URL);


                channel.assertQueue('postMovie', {durable: false})
                channel.consume('postMovie', async (msg) => {
                    try {
                        console.log(Buffer.isBuffer(msg.content));
                        const movie = JSON.parse(msg.content.toString())
                        await MovieData.create(movie)
                        console.log('product created')
                    } catch (error) {
                        console.log(error)
                    }
                    
                })



                channel.assertQueue('movieId', {durable: false})
                channel.consume('movieId', async (msg) => {
                    try {
                        const movieId = JSON.parse(msg.content.toString())
                        const data = await MovieData.find({kinopoiskId: movieId})
                        console.log(data)
                        channel.sendToQueue('movieData', Buffer.from(JSON.stringify(data)))
                        channel.purgeQueue('movieId')
                        channel.purgeQueue('movieData')
                        // channel.ack(msg)
                    } catch (error) {
                        console.log(error)
                    }
                    
                }, { noAck: true })

                app.listen(PORT, () => console.log('server started on port ' + 8000));
                process.on('beforeExit', () => {
                    console.log('closing')
                    connection.close();
                })

            })
        })

    } catch (error) {
        console.log(error)
    }
}

startApp();



  