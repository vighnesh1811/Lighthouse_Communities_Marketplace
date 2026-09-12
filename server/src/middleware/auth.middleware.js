import jwt from 'jsonwebtoken'

export function requireAdmin(request, response, next) {
  const token = request.headers.authorization?.replace('Bearer ', '')
  if (!token) return response.status(401).json({ message: 'Admin authentication required.' })

  try {
    request.admin = jwt.verify(token, process.env.JWT_SECRET)
    return next()
  } catch {
    return response.status(401).json({ message: 'Invalid or expired admin session.' })
  }
}
