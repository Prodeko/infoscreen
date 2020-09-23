const Koa = require('koa')
const Router = require('koa-router')
const next = require('next')
const Sentry = require('@sentry/node')

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()
var request = require('request')
const { API_URL, GIPHY_KEY, SENTRY_DSN } = require('./config')

Sentry.init({ dsn: SENTRY_DSN })

app.prepare().then(() => {
  const server = new Koa()
  const router = new Router()

  server.on('error', (err) => {
    Sentry.captureException(err)
  })

  router.get('/restaurants/(.*)', async (ctx) => {
    ctx.body = request(`https://kitchen.kanttiinit.fi${ctx.req.url}`)
  })

  router.get('/slides', async (ctx) => {
    ctx.body = request(`${API_URL}/slides/?format=json`)
  })

  router.get('/gifs', async (ctx) => {
    ctx.body = request(
      `http://api.giphy.com/v1/gifs/random?api_key=${GIPHY_KEY}&rating=g`,
    )
  })

  router.get('/time', async (ctx) => {
    console.log(API_URL)
    ctx.body = request(`${API_URL}/time/`)
  })

  router.all('(.*)', async (ctx) => {
    await handle(ctx.req, ctx.res)
    ctx.respond = false
  })

  server.use(async (ctx, next) => {
    ctx.res.statusCode = 200
    await next()
  })

  server.use(router.routes())

  server.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
})
