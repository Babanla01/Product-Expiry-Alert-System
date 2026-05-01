const User = require('../models/User')

const createStaff = async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email and password' })
    }

    const exists = await User.findOne({ email })
    if (exists) {
      return res.status(400).json({ message: 'Email already in use' })
    }

    const staff = await User.create({ name, email, password, role: 'staff' })

    res.status(201).json({
      _id: staff._id,
      name: staff.name,
      email: staff.email,
      role: staff.role,
      isActive: staff.isActive,
      createdAt: staff.createdAt,
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const getAllStaff = async (req, res) => {
  try {
    const staff = await User.find({ role: 'staff' }).select('-password').sort({ createdAt: -1 })
    res.json(staff)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const deactivateStaff = async (req, res) => {
  try {
    const staff = await User.findById(req.params.id)

    if (!staff || staff.role !== 'staff') {
      return res.status(404).json({ message: 'Staff not found' })
    }

    staff.isActive = false
    await staff.save()

    res.json({ message: 'Staff deactivated successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const deleteStaff = async (req, res) => {
  try {
    const staff = await User.findById(req.params.id)

    if (!staff || staff.role !== 'staff') {
      return res.status(404).json({ message: 'Staff not found' })
    }

    await staff.deleteOne()
    res.json({ message: 'Staff deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { createStaff, getAllStaff, deactivateStaff, deleteStaff }