const express = require('express')



const app = express()
const port = 3000


app.use(express.static('public'))
app.use('/css', express.static(__dirname + 'public/css'))

app.use('/js', express.static(__dirname + 'public/js'))


app.set('views', './src/views')
app.set('view engine', 'ejs')

const homeRouter = require('./src/routes/home')

app.use('/', homeRouter)


app.listen(process.env.PORT || port, () => console.log(`Listening on port ${port}`))