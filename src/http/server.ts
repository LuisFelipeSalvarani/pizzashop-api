import { swagger } from '@elysiajs/swagger'
import { Elysia } from 'elysia'
import { authenticateFromLink } from './routes/authenticate-from-link'
import { getProfile } from './routes/get-profile'
import { registerRestaurant } from './routes/register-restaurants'
import { sendAuthLink } from './routes/send-auth-link'
import { sighOut } from './routes/sign-out'

const app = new Elysia()
  .use(swagger())
  .use(registerRestaurant)
  .use(sendAuthLink)
  .use(authenticateFromLink)
  .use(sighOut)
  .use(getProfile)

app.listen(3333, () => {
  console.log('🔥 HTTP server running!')
})
