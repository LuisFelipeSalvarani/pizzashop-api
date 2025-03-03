import { createId } from '@paralleldrive/cuid2'
import { relations } from 'drizzle-orm'
import { integer, pgTable, text } from 'drizzle-orm/pg-core'
import { orders, products } from '.'

export const orderItens = pgTable('order_itens', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  orderId: text('order_id')
    .notNull()
    .references(() => orders.id, {
      onDelete: 'cascade',
    }),
  productId: text('product_id').references(() => products.id, {
    onDelete: 'set null',
  }),
  priceInCents: integer('price_in_cents').notNull(),
  quantity: integer('quantity').notNull(),
})

export const orderItensRelations = relations(orderItens, ({ one }) => {
  return {
    order: one(orders, {
      fields: [orderItens.orderId],
      references: [orders.id],
      relationName: 'order_item_order',
    }),
    product: one(products, {
      fields: [orderItens.productId],
      references: [products.id],
      relationName: 'order_item_product',
    }),
  }
})
