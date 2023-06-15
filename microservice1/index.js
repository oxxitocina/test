import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import amqp from 'amqplib/callback_api.js'
import MovieData from './movieData.js';
import MovieVideo from './movieVideo.js';
import protobuf from 'protobufjs'

const PORT = 5000;
const DB_URL = 'mongodb+srv://user:user@cluster0.4b9gqtt.mongodb.net/'

const app = express();
app.use(express.json())

app.use(cors({
    origin: ['http://localhost:1234', 'http://localhost:5000','http://localhost:3000',]
}))





async function startApp()   {
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
 
                app.post('/api/movies', async(req, res) => {
                    try {   
                        const { kinopoiskId, imdbId, nameRu, nameEn, nameOriginal, countries, genres, ratingKinopoisk, ratingImdb, year, type, posterUrl, posterUrlPreview } = req.body
                        // const movieData = await MovieData.create({kinopoiskId, imdbId, nameRu, nameEn, nameOriginal, countries, genres, ratingKinopoisk, ratingImdb, year, type, posterUrl, posterUrlPreview})
                        const encodedMovie = MovieIdProto.encode({id: kinopoiskId}).finish()
                        channel.sendToQueue('postMovie', Buffer.from(JSON.stringify(req.body)))
                        channel.sendToQueue('getVideos', Buffer.from(encodedMovie))
                        // const postProto = PostProto.create({kinopoiskId, imdbId, nameRu, nameEn, nameOriginal, countries, genres, ratingKinopoisk, ratingImdb, year, type, posterUrl, posterUrlPreview});
                        // const encodedPost = PostProto.encode(postProto).finish()

                        // console.log(Buffer.isBuffer(encodedPost))
                        // console.log(encodedPost);
                        // const obj = PostProto.decode(encodedPost);
                        // console.log(obj);
                        // channel.sendToQueue('post', Buffer.from(encodedPost))
                        // channel.sendToQueue('post', Buffer.from(JSON.stringify(post)))
                        return res.status(200).json({status: 'delivered'});
                    } catch (error) {
                        console.log(error)
                        res.status(500).json(error)
                    }
                })



                app.get('/api/movies/:id', async(req, res) => {
                    try {
                        const movie = await MovieData.findOne({'kinopoiskId': req.params.id})
                        const movieVid = await MovieVideo.findOne({'id': req.params.id})
                        const obj = [movie, movieVid]
                        return res.json(obj)

                    } catch (error) {
                        res.status(500).json(error)
                    }
                })



                // channel.assertQueue('movieData', {durable: false})
                // channel.assertQueue('movies', {durable: false})

                // app.get('/api/movies/:id', async(req, res) => {
                //     try {
                //         const { id } = req.params
                //         channel.sendToQueue('movieId', Buffer.from(JSON.stringify(id)))
                //         channel.sendToQueue('genreId', Buffer.from(JSON.stringify(id)))


                //         channel.assertQueue('movieData', {durable: false})
                //         channel.consume('movieData', (msg) => {
                //             try {
                //                 channel.prefetch(1)
                //                 const object = JSON.parse(msg.content.toString())
                //                 console.log(object)
                //                 // channel.ack(msg)
                //                 console.log(typeof object)
                                
                //                 channel.ack(msg)
                //                 channel.purgeQueue('movieData')
                //                 // channel.purgeQueue('movieId')
                //                 channel.ackAll()
                //                 return res.json(object)
                //         //                 channel.assertQueue('movies', {durable: false})
                //         //                 channel.consume('movies', (msg) => {
                //         //             try {
                //         //                 console.log(object)
                //         //                 // const eventObject2 = JSON.parse(msg.content.toString())
                //         //                 // const responseJson = { ...eventObject, ...eventObject2 }
                //         //                 // console.log(responseJson)
                                        
                                        
                //         //                 // res.json(responseJson)
                //         //             } catch (error) {
                //         //                 console.log(error)
                //         //             }
                //         // })
                //             } catch (error) {
                //                 console.log(error)
                //             }
                //         }, { noAck: false })

                        

                //         channel.assertQueue('movies', {durable: false})
                //                         channel.consume('movies', (msg) => {
                //                     try {
                                        
                //                         const eventObject2 = JSON.parse(msg.content.toString())
                //                         // const responseJson = { ...eventObject, ...eventObject2 }
                //                         console.log(eventObject2)
                                        
                                        
                //                         // res.json(responseJson)
                //                     } catch (error) {
                //                         console.log(error)
                //                     }
                //         })

                        

                        
                        
                //     } catch (error) {
                //         res.status(500).json(error)
                //     }
                // })

                

                app.listen(PORT, () => console.log('server started on port ' + 5000));
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