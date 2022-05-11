const express = require('express')
const axios = require('axios')
const cors = require('cors')
const redis = require('redis')

const client = redis.createClient()
client.connect()

const app = express()
app.use(cors())

app.get('/photos', async (req, res) => {
    const albumId = req.query.albumId

    const photos = await client.get(`photos?albumId=${albumId}`)
    if (photos != null) {
        console.log('cache hit!')
        res.json(JSON.parse(photos))
    } else {
        console.log('cache miss!')

        const { data } = await axios.get('https://jsonplaceholder.typicode.com/photos', { params: { albumId } })

        client.setEx(`photos?albumId=${albumId}`, 3600, JSON.stringify(data))
        res.json(data)
    }
})

app.get('/photos/:id', async (req, res) => {
    const photos = await client.get(`photos:${req.params.id}`)

    if (photos != null) {
        console.log('cache hit!')
        res.json(JSON.parse(photos))
    } else {
        console.log('cache miss!')

        const { data } = await axios.get(`https://jsonplaceholder.typicode.com/photos/${req.params.id}`)
        client.setEx(`photos:${req.params.id}`, 3600, JSON.stringify(data))

        res.json(data)
    }

    console.log('process done!')
})

app.listen(3000, () => {
    console.log('connected')
})
