import { swagger } from '@elysiajs/swagger'
import { Elysia } from 'elysia'
import { approveOrder } from './routes/approve-order'
import { authenticateFromLink } from './routes/authenticate-from-link'
import { cancelOrder } from './routes/cancel-order'
import { deliverOrder } from './routes/deliver-order'
import { dispatchOrder } from './routes/dispatch-order'
import { getDailyReceiptInPeriod } from './routes/get-daily-receipt-in-period'
import { getDayOrdersAmount } from './routes/get-day-orders-amount'
import { getManagedRestaurant } from './routes/get-managed-restaurant'
import { getMonthCanceledOrdersAmount } from './routes/get-month-canceled-orders'
import { getMonthOrdersAmount } from './routes/get-month-orders-amount'
import { getMonthReceipt } from './routes/get-month-receipt'
import { getOrderDetails } from './routes/get-order-details'
import { getOrders } from './routes/get-orders'
import { getPopularProducts } from './routes/get-popular-products'
import { getProfile } from './routes/get-profile'
import { registerRestaurant } from './routes/register-restaurants'
import { sendAuthLink } from './routes/send-auth-link'
import { sighOut } from './routes/sign-out'

const app = new Elysia()
  .use(swagger({
    documentation: {
      info: {
        title: 'Pizza Shop API Documentation',
        version: '1.0.0'
      },
      tags: [
        {name: 'Auth', description: 'Authentication endpoints.'},
        {name: 'Profile', description: 'Profile endpoints.'},
        {name: 'Restaurants', description: 'Restaurants endpoints.'},
        {name: 'Orders', description: 'Orders endpoints.'},
        {name: 'Metrics', description: 'Metrics endpoints.'},
      ],
    }
  }))
  .use(registerRestaurant)
  .use(sendAuthLink)
  .use(authenticateFromLink)
  .use(sighOut)
  .use(getProfile)
  .use(getManagedRestaurant)
  .use(getOrderDetails)
  .use(approveOrder)
  .use(cancelOrder)
  .use(deliverOrder)
  .use(dispatchOrder)
  .use(getOrders)
  .use(getMonthReceipt)
  .use(getDayOrdersAmount)
  .use(getMonthOrdersAmount)
  .use(getMonthCanceledOrdersAmount)
  .use(getPopularProducts)
  .use(getDailyReceiptInPeriod)
  .onError(({ code, error, set }) => {
    switch (code) {
      case 'VALIDATION': {
        set.status = error.status

        return error.toResponse()
      }
      case 'NOT_FOUND': {
        return new Response(null, { status: 404 })
      }
      default: {
        set.status = 500

        console.error(error)

        return new Response(null, { status: 500 })
      }
    }
  })

app.listen(3333, () => {
  console.log('🔥 HTTP server running!')
})
