import { Router } from 'express'
import pool from '../config/database.js'
import { requireAdmin } from '../middleware/auth.middleware.js'
import { productImageUpload } from '../middleware/upload.middleware.js'

const router = Router()
router.use('/', requireAdmin)

router.get('/products', async (_request, response, next) => {
  try {
    const [rows] = await pool.query(`SELECT p.id, p.name, p.slug, p.description, p.price,
      p.stock_quantity, p.status, p.learner_program, c.name AS category, c.id AS category_id
      FROM products p INNER JOIN categories c ON c.id = p.category_id
      WHERE p.status = 'active' ORDER BY p.created_at DESC`)
    return response.json(rows)
  } catch (error) { return next(error) }
})

router.post('/products', productImageUpload.single('image'), async (request, response, next) => {
  const { name, description, price, categoryId, stockQuantity = 0, learnerProgram = '' } = request.body
  if (!name || !description || Number(price) <= 0 || !Number.isInteger(Number(categoryId)) || Number(stockQuantity) < 0) {
    return response.status(400).json({ message: 'Name, description, positive price, category, and valid stock are required.' })
  }
  const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`
  try {
    const imageUrl = request.file ? `/uploads/products/${request.file.filename}` : null
    const [result] = await pool.query(`INSERT INTO products
      (name, slug, description, price, category_id, stock_quantity, learner_program, primary_image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [name, slug, description, Number(price), categoryId, Number(stockQuantity), learnerProgram, imageUrl])
    return response.status(201).json({ id: result.insertId, slug })
  } catch (error) { return next(error) }
})

router.patch('/products/:id', async (request, response, next) => {
  const { name, description, price, categoryId, stockQuantity, status, learnerProgram } = request.body
  try {
    const [result] = await pool.query(`UPDATE products SET name = ?, description = ?, price = ?,
      category_id = ?, stock_quantity = ?, status = ?, learner_program = ? WHERE id = ?`,
    [name, description, Number(price), categoryId, Number(stockQuantity), status, learnerProgram || '', request.params.id])
    if (!result.affectedRows) return response.status(404).json({ message: 'Product not found.' })
    return response.json({ message: 'Product updated.' })
  } catch (error) { return next(error) }
})

router.delete('/products/:id', async (request, response, next) => {
  try {
    const [result] = await pool.query("UPDATE products SET status = 'archived' WHERE id = ?", [request.params.id])
    if (!result.affectedRows) return response.status(404).json({ message: 'Product not found.' })
    return response.json({ message: 'Product archived.' })
  } catch (error) { return next(error) }
})

router.get('/categories', async (_request, response, next) => {
  try {
    const [rows] = await pool.query('SELECT id, name, slug, description FROM categories ORDER BY name ASC')
    return response.json(rows)
  } catch (error) { return next(error) }
})

router.get('/orders', async (_request, response, next) => {
  try {
    const [rows] = await pool.query(`SELECT o.id, o.order_number, o.total_amount, o.payment_method,
      o.payment_status, o.order_status, o.cancellation_reason, o.created_at, c.full_name, c.phone
      FROM orders o INNER JOIN customers c ON c.id = o.customer_id ORDER BY o.created_at DESC`)
    return response.json(rows)
  } catch (error) { return next(error) }
})

router.get('/orders/:id', async (request, response, next) => {
  try {
    const [[order]] = await pool.query(`SELECT o.id, o.order_number, o.subtotal, o.total_amount,
      o.payment_method, o.payment_status, o.order_status, o.created_at, o.cancellation_reason,
      c.full_name, c.phone, c.email,
      a.house_flat, a.street, a.area, a.landmark, a.city, a.state, a.pin_code
      FROM orders o INNER JOIN customers c ON c.id = o.customer_id
      INNER JOIN addresses a ON a.order_id = o.id WHERE o.id = ?`, [request.params.id])
    if (!order) return response.status(404).json({ message: 'Order not found.' })
    const [items] = await pool.query(`SELECT product_name, quantity, unit_price, subtotal
      FROM order_items WHERE order_id = ? ORDER BY id`, [request.params.id])
    const [[payment]] = await pool.query(`SELECT payment_method, amount, transaction_id,
      payment_proof, status, verified_at FROM payments WHERE order_id = ? ORDER BY id DESC LIMIT 1`, [request.params.id])
    return response.json({ ...order, items, payment })
  } catch (error) { return next(error) }
})

router.get('/payments', async (_request, response, next) => {
  try {
    const [rows] = await pool.query(`SELECT p.id, p.order_id, o.order_number, c.full_name,
      p.amount, p.payment_method, p.transaction_id, p.payment_proof, p.status
      FROM payments p INNER JOIN orders o ON o.id = p.order_id
      INNER JOIN customers c ON c.id = o.customer_id ORDER BY p.created_at DESC`)
    return response.json(rows)
  } catch (error) { return next(error) }
})

router.patch('/payments/:id/status', async (request, response, next) => {
  const allowed = ['pending', 'verified', 'rejected', 'paid']
  if (!allowed.includes(request.body.status)) return response.status(400).json({ message: 'Invalid payment status.' })
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const [paymentResult] = await connection.query(
      'UPDATE payments SET status = ?, verified_by = ?, verified_at = NOW() WHERE id = ?',
      [request.body.status, request.admin.id, request.params.id],
    )
    if (!paymentResult.affectedRows) { await connection.rollback(); return response.status(404).json({ message: 'Payment not found.' }) }
    const orderPaymentStatus = request.body.status === 'verified' ? 'verified' : request.body.status === 'paid' ? 'paid' : request.body.status === 'rejected' ? 'rejected' : 'pending_verification'
    await connection.query('UPDATE orders o INNER JOIN payments p ON p.order_id = o.id SET o.payment_status = ? WHERE p.id = ?', [orderPaymentStatus, request.params.id])
    await connection.commit()
    return response.json({ message: 'Payment status updated.' })
  } catch (error) { await connection.rollback(); return next(error) } finally { connection.release() }
})

router.patch('/orders/:id/status', async (request, response, next) => {
  const allowed = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']
  if (!allowed.includes(request.body.status)) return response.status(400).json({ message: 'Invalid order status.' })
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const [result] = await connection.query('UPDATE orders SET order_status = ? WHERE id = ?', [request.body.status, request.params.id])
    if (!result.affectedRows) { await connection.rollback(); return response.status(404).json({ message: 'Order not found.' }) }
    await connection.query('INSERT INTO order_status_history (order_id, status, changed_by) VALUES (?, ?, ?)', [request.params.id, request.body.status, request.admin.id])
    await connection.commit()
    return response.json({ message: 'Order status updated.' })
  } catch (error) { await connection.rollback(); return next(error) } finally { connection.release() }
})

export default router
