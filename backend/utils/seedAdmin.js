const dotenv = require('dotenv')
const mongoose = require('mongoose')
const User = require('../models/User')

dotenv.config()

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)

    const adminExists = await User.findOne({ role: 'admin' })

    if (adminExists) {
      console.log('Admin already exists:', adminExists.email)
      process.exit(0)
    }

    const admin = await User.create({
      name: 'Admin',
      email: 'admin@expiryalert.com',
      password: 'admin123456',
      role: 'admin',
    })

    console.log('Admin created successfully:')
    console.log('Email:', admin.email)
    console.log('Password: admin123456')
    console.log('Please change the password after first login!')

    process.exit(0)
  } catch (error) {
    console.error('Seed error:', error.message)
    process.exit(1)
  }
}

seedAdmin()