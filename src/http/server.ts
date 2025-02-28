import cookie from '@elysiajs/cookie'
import jwt from '@elysiajs/jwt'
import { swagger } from '@elysiajs/swagger'
import { Elysia, t } from 'elysia'
import { env } from '../env'
import { registerRestaurant } from './routes/register-restaurants'
import { sendAuthLink } from './routes/send-auth-link'

const app = new Elysia()
  .use(
    jwt({
      secret: env.JWT_SECRET_KEY,
      schema: t.Object({
        sub: t.String(),
        restaurantId: t.Optional(t.String()),
      }),
    })
  )
  .use(cookie())
  .use(swagger())
  .use(registerRestaurant)
  .use(sendAuthLink)

app.listen(3333, () => {
  console.log('🔥 HTTP server running!')
})
