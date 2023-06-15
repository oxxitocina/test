import express from 'express'
import mongoose from 'mongoose'
import router from './router.js';
import cors from 'cors'
import amqp from 'amqplib/callback_api.js'
import Post from "./post.js";
import MovieData from './movieData.js';
import protobuf from 'protobufjs'

const PORT = 5000;
const DB_URL = 'mongodb+srv://user:user@cluster0.xebnxp7.mongodb.net/'

const app = express();
app.use(express.json())

app.use(cors({
    origin: ['http://localhost:1234', 'http://localhost:5000','http://localhost:3000',]
}))

// app.use('/api', router)


async function startApp()   {
    try {
        const root = await protobuf.load('post.proto')
        const PostProto = root.lookupType('postpackage.Post')

        amqp.connect('amqps://bzecpdsx:ohp1UJe_qnSflyW65NGAPiqTKhoDQoxY@hawk.rmq.cloudamqp.com/bzecpdsx', (error0, connection) => {
            if(error0) {
                throw error0
            }

            connection.createChannel((error1, channel) => {
                if(error1) {
                    throw error1
                }

                mongoose.connect(DB_URL);
 
                app.post('/api/movies', async(req, res) => {
                    try {   
                        const { kinopoiskId, imdbId, nameRu, nameEn, nameOriginal, countries, genres, ratingKinopoisk, ratingImdb, year, type, posterUrl, posterUrlPreview } = req.body
                        const movieData = await MovieData.create({kinopoiskId, imdbId, nameRu, nameEn, nameOriginal, countries, genres, ratingKinopoisk, ratingImdb, year, type, posterUrl, posterUrlPreview})
                        // const postProto = PostProto.create({kinopoiskId, imdbId, nameRu, nameEn, nameOriginal, countries, genres, ratingKinopoisk, ratingImdb, year, type, posterUrl, posterUrlPreview});
                        // const encodedPost = PostProto.encode(postProto).finish()
                        // console.log(Buffer.isBuffer(encodedPost))
                        // console.log(encodedPost);
                        // const obj = PostProto.decode(encodedPost);
                        // console.log(obj);
                        // channel.sendToQueue('post', Buffer.from(encodedPost))
                        // channel.sendToQueue('post', Buffer.from(JSON.stringify(post)))
                        res.status(200).json(movieData)
                    } catch (error) {
                        res.status(500).json(error)
                    }
                })

                app.get('/api/movies/:id', async(req, res) => {
                    try {
                        const { id } = req.params
                        channel.sendToQueue('movieId', Buffer.from(JSON.stringify(id)))
                        channel.sendToQueue('genreId', Buffer.from(JSON.stringify(id)))

                        channel.assertQueue('movieData', {durable: false})
                        channel.consume('movieData', (msg) => {
                            try {
                                const eventObject = JSON.parse(msg.content.toString())
                                console.log(eventObject)

                                        channel.assertQueue('movies', {durable: false})
                                        channel.consume('movies', (msg) => {
                                    try {
                                        const eventObject2 = JSON.parse(msg.content.toString())
                                        console.log(eventObject2)
                                        return res.json([eventObject, eventObject2])
                                    } catch (error) {
                                        console.log(error)
                                    }
                        })
                            } catch (error) {
                                console.log(error)
                            }
                        })
                        
                    } catch (error) {
                        res.status(500).json(error)
                    }
                })

                app.listen(PORT, () => console.log('server started on port ' + 5000));
                process.on('beforeExit', () => {
                    console.log('closing')
                    connection.close();
                })

            })
        })
        return 'successful connection'
    } catch (error) {
        console.log(error)
    }
}

test('test', async () => {
    const data = await startApp();
    expect(data).toBe('successful connection');
  });