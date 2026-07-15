const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const expiryChecker = require('./jobs/expiryChecker')

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth',      require('./routes/auth.routes'))
app.use('/api/staff',     require('./routes/staff.routes'))
app.use('/api/products',  require('./routes/product.routes'))
app.use('/api/categories',require('./routes/category.routes'))
app.use('/api/suppliers', require('./routes/supplier.routes'))
app.use('/api/alerts',    require('./routes/alert.routes'))
app.use('/api/dashboard', require('./routes/dashboard.routes'))
app.use('/api/export',    require('./routes/export.routes'))
app.use('/api/audit',     require('./routes/audit.routes'))

app.get('/', (req, res) => {
  res.json({ message: 'Delight Supermarket API is running' })
})

const startServer = async () => {
  try {
    await connectDB()
    expiryChecker()

    const PORT = process.env.PORT || 5000
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error.message)
    process.exit(1)
  }
}

startServer()

// const express = require('express')
// const cors = require('cors')
// const dotenv = require('dotenv')
// const connectDB = require('./config/db')
// const expiryChecker = require('./jobs/expiryChecker')

// dotenv.config()

// const app = express()
// app.use(cors())
// app.use(express.json())

// app.use('/api/auth',      require('./routes/auth.routes'))
// app.use('/api/staff',     require('./routes/staff.routes'))
// app.use('/api/products',  require('./routes/product.routes'))
// app.use('/api/categories',require('./routes/category.routes'))
// app.use('/api/suppliers', require('./routes/supplier.routes'))
// app.use('/api/alerts',    require('./routes/alert.routes'))
// app.use('/api/dashboard', require('./routes/dashboard.routes'))
// app.use('/api/export',    require('./routes/export.routes'))
// app.use('/api/audit',     require('./routes/audit.routes'))

// app.get('/', (req, res) => res.json({ message: 'Expiry Alert API is running' }))

// const PORT = process.env.PORT || 5000

// connectDB().then(() => {
//   app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
//   expiryChecker()
// })