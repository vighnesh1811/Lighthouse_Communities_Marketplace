import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Router } from 'express'
import pool from '../config/database.js'
import { requireAdmin } from '../middleware/auth.middleware.js'

const router = Router()

router.post('/admin/login', async (request, response, next) => {
  const { email, password } = request.body
  if (!email || !password) return response.status(400).json({ message: 'Email and password are required.' })

  try {
    const [rows] = await pool.query('SELECT id, name, email, password_hash FROM admins WHERE email = ?', [email])
    if (!rows.length || !(await bcrypt.compare(password, rows[0].password_hash))) {
      return response.status(401).json({ message: 'Invalid admin credentials.' })
    }
    const admin = { id: rows[0].id, name: rows[0].name, email: rows[0].email }
    const token = jwt.sign(admin, process.env.JWT_SECRET, { expiresIn: '4h' })
    return response.json({ token, admin })
  } catch (error) {
    return next(error)
  }
})

router.get('/admin/dashboard', requireAdmin, async (_request, response, next) => {
  try {
    const [[products]] = await pool.query('SELECT COUNT(*) AS totalProducts, SUM(stock_quantity > 0) AS availableProducts, SUM(stock_quantity = 0) AS outOfStockProducts FROM products WHERE status = \'active\'')
    const [[orders]] = await pool.query(`SELECT COUNT(*) AS totalOrders,
      SUM(order_status = 'pending') AS pendingOrders,
      SUM(order_status = 'delivered') AS deliveredOrders,
      SUM(order_status = 'cancelled') AS cancelledOrders,
      SUM(payment_status = 'pending_verification') AS qrPaymentsPending
      FROM orders`)
    return response.json({ products, orders })
  } catch (error) {
    return next(error)
  }
})

export default router
