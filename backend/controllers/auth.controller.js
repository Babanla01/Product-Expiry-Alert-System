// const jwt = require('jsonwebtoken')
// const User = require('../models/User')

// const generateToken = (id) => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_EXPIRES_IN || '7d',
//   })
// }

// const login = async (req, res) => {
//   try {
//     const { email, password } = req.body

//     if (!email || !password) {
//       return res.status(400).json({ message: 'Please provide email and password' })
//     }

//     const user = await User.findOne({ email })

//     if (!user || !user.isActive) {
//       return res.status(401).json({ message: 'Invalid credentials' })
//     }

//     const isMatch = await user.matchPassword(password)

//     if (!isMatch) {
//       return res.status(401).json({ message: 'Invalid credentials' })
//     }

//     res.json({
//       _id: user._id,
//       name: user.name,
//       email: user.email,
//       role: user.role,
//       token: generateToken(user._id),
//     })
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message })
//   }
// }

// const getMe = async (req, res) => {
//   res.json({
//     _id: req.user._id,
//     name: req.user.name,
//     email: req.user.email,
//     role: req.user.role,
//   })
// }

// const changePassword = async (req, res) => {
//   try {
//     const { currentPassword, newPassword } = req.body

//     if (!currentPassword || !newPassword) {
//       return res.status(400).json({ message: 'Please provide current and new password' })
//     }

//     if (newPassword.length < 6) {
//       return res.status(400).json({ message: 'New password must be at least 6 characters' })
//     }

//     const user = await User.findById(req.user._id)
//     const isMatch = await user.matchPassword(currentPassword)

//     if (!isMatch) {
//       return res.status(401).json({ message: 'Current password is incorrect' })
//     }

//     user.password = newPassword
//     await user.save()

//     res.json({ message: 'Password changed successfully' })
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message })
//   }
// }

// module.exports = { login, getMe, changePassword }

const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { logAction } = require('../utils/audit')

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' })
    }
    const user = await User.findOne({ email })
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    const isMatch = await user.matchPassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
      token: generateToken(user._id),
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const getMe = async (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    mustChangePassword: req.user.mustChangePassword,
  })
}

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' })
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' })
    }
    const user = await User.findById(req.user._id)
    const isMatch = await user.matchPassword(currentPassword)
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' })
    }
    user.password = newPassword
    user.mustChangePassword = false
    await user.save()
    await logAction({
      action: 'PASSWORD_CHANGED', entity: 'User',
      entityId: user._id, entityName: user.name,
      performedBy: req.user._id,
    })
    res.json({ message: 'Password changed successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { login, getMe, changePassword }