import 'dotenv/config'
import express from 'express'
import { contentFetchRequestHandler } from './request_handler'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

if (!process.env.VERIFICATION_TOKEN) {
  throw new Error('VERIFICATION_TOKEN environment variable is not set')
}

app.get('/_ah/health', (req, res) => res.sendStatus(200))

app.all('/', (req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'POST') {
    console.error('request method is not GET or POST')
    return res.sendStatus(405)
  }

  if (req.query.token !== process.env.VERIFICATION_TOKEN) {
    console.error('query does not include valid token')
    return res.sendStatus(403)
  }

  return contentFetchRequestHandler(req, res, next)
})

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080
app.listen(PORT, '::', () => {
  console.log(`App listening on port ${PORT} (IPv4 and IPv6)`)
  console.log('Press Ctrl+C to quit.')
})
