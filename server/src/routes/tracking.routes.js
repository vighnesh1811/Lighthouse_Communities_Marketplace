import { Router } from 'express'
import pool from '../config/database.js'

const router = Router()

router.post('/orders/find', async (request, response, next) => {
  const { phone, email } = request.body
  if (!phone || !email) return response.status(400).json({ message: 'Phone number and email are required.' })
  try {
    const [rows] = await pool.query(`SELECT o.order_number, o.created_at, o.total_amount,
      o.payment_method, o.payment_status, o.order_status,
      GROUP_CONCAT(CONCAT(oi.product_name, ' x ', oi.quantity) SEPARATOR ', ') AS items
      FROM orders o INNER JOIN customers c ON c.id = o.customer_id
      INNER JOIN order_items oi ON oi.order_id = o.id
      WHERE c.phone = ? AND c.email = ? GROUP BY o.id ORDER BY o.created_at DESC LIMIT 10`, [phone, email])
    if (!rows.length) return response.status(404).json({ message: 'No orders found for those details.' })
    return response.json(rows)
  } catch (error) { return next(error) }
})

router.post('/orders/track', async (request, response, next) => {
  const { orderNumber, phone } = request.body
  if (!orderNumber || !phone) return response.status(400).json({ message: 'Order ID and phone number are required.' })
  try {
    const [rows] = await pool.query(`SELECT o.order_number, o.created_at, o.total_amount, o.payment_method,
      o.payment_status, o.order_status, c.full_name,
      GROUP_CONCAT(CONCAT(oi.product_name, ' x ', oi.quantity) SEPARATOR ', ') AS items
      FROM orders o INNER JOIN customers c ON c.id = o.customer_id
      INNER JOIN order_items oi ON oi.order_id = o.id
      WHERE o.order_number = ? AND c.phone = ? GROUP BY o.id`, [orderNumber, phone])
    if (!rows.length) return response.status(404).json({ message: 'No matching order found.' })
    return response.json(rows[0])
  } catch (error) { return next(error) }
})

router.post('/orders/:orderNumber/cancel', async (request, response, next) => {
  try {
    const [result] = await pool.query(`UPDATE orders o INNER JOIN customers c ON c.id = o.customer_id
      SET o.order_status = 'cancelled', o.cancellation_reason = ?
      WHERE o.order_number = ? AND c.phone = ? AND o.order_status IN ('pending', 'confirmed')`,
    [request.body.reason || 'Customer requested cancellation.', request.params.orderNumber, request.body.phone])
    if (!result.affectedRows) return response.status(409).json({ message: 'This order cannot be cancelled or the details do not match.' })
    return response.json({ message: 'Cancellation requested successfully.' })
  } catch (error) { return next(error) }
})

export default router
