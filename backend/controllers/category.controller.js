const Category = require('../models/Category')

const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' })
    }

    const exists = await Category.findOne({ name: name.trim() })
    if (exists) {
      return res.status(400).json({ message: 'Category already exists' })
    }

    const category = await Category.create({
      name,
      description,
      createdBy: req.user._id,
    })

    res.status(201).json(category)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .populate('createdBy', 'name')
      .sort({ name: 1 })
    res.json(categories)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)

    if (!category) {
      return res.status(404).json({ message: 'Category not found' })
    }

    const { name, description } = req.body
    if (name) category.name = name
    if (description !== undefined) category.description = description

    await category.save()
    res.json(category)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)

    if (!category) {
      return res.status(404).json({ message: 'Category not found' })
    }

    await category.deleteOne()
    res.json({ message: 'Category deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { createCategory, getAllCategories, updateCategory, deleteCategory }