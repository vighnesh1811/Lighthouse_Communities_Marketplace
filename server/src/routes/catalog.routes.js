import { Router } from 'express'
import pool from '../config/database.js'

const router = Router()

router.get('/categories', async (_request, response, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, slug, description FROM categories ORDER BY name ASC',
    )
    response.json(rows)
  } catch (error) {
    next(error)
  }
})

router.get('/products', async (request, response, next) => {
  const {
    q = '',
    category = '',
    minPrice = '',
    maxPrice = '',
    availability = '',
    sort = 'newest',
  } = request.query
  const values = []
  const conditions = ["p.status = 'active'", "(p.learner_program IS NULL OR p.learner_program <> 'Demo product')"]

  if (q.trim()) {
    conditions.push('(p.name LIKE ? OR p.description LIKE ?)')
    values.push(`%${q.trim()}%`, `%${q.trim()}%`)
  }
  if (category.trim()) {
    conditions.push('c.slug = ?')
    values.push(category.trim())
  }
  if (minPrice !== '' && Number.isFinite(Number(minPrice))) {
    conditions.push('p.price >= ?')
    values.push(Number(minPrice))
  }
  if (maxPrice !== '' && Number.isFinite(Number(maxPrice))) {
    conditions.push('p.price <= ?')
    values.push(Number(maxPrice))
  }
  if (availability === 'available') conditions.push('p.stock_quantity > 0')
  if (availability === 'out-of-stock') conditions.push('p.stock_quantity = 0')

  const sortMap = {
    newest: 'p.created_at DESC',
    price_low: 'p.price ASC',
    price_high: 'p.price DESC',
    name: 'p.name ASC',
  }
  const orderBy = sortMap[sort] || sortMap.newest

  try {
    const [rows] = await pool.query(
      `SELECT p.id, p.name, p.slug, p.description, p.price, p.stock_quantity,
        p.learner_program, p.primary_image_url, c.name AS category, c.slug AS category_slug
       FROM products p
       INNER JOIN categories c ON c.id = p.category_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY ${orderBy}`,
      values,
    )
    response.json({ products: rows, count: rows.length })
  } catch (error) {
    next(error)
  }
})

router.get('/products/:id', async (request, response, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.id, p.name, p.slug, p.description, p.price, p.stock_quantity,
        p.learner_program, p.primary_image_url, c.name AS category, c.slug AS category_slug
       FROM products p
       INNER JOIN categories c ON c.id = p.category_id
       WHERE p.id = ? AND p.status = 'active'
         AND (p.learner_program IS NULL OR p.learner_program <> 'Demo product')`,
      [request.params.id],
    )
    if (!rows.length) return response.status(404).json({ message: 'Product not found.' })
    return response.json(rows[0])
  } catch (error) {
    return next(error)
  }
})

export default router
