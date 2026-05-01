const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const expiryChecker = require('./jobs/expiryChecker')

dotenv.config()

const app = express()

// Connect database
connectDB()

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/auth', require('./routes/auth.routes'))
app.use('/api/staff', require('./routes/staff.routes'))
app.use('/api/products', require('./routes/product.routes'))
app.use('/api/categories', require('./routes/category.routes'))
app.use('/api/alerts', require('./routes/alert.routes'))
app.use('/api/dashboard', require('./routes/dashboard.routes'))

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Expiry Alert API is running' })
})

// Start cron job
expiryChecker()

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})