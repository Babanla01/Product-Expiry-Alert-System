const test = require('node:test')
const assert = require('node:assert/strict')
const mongoose = require('mongoose')
const { resolveSupplierId } = require('../utils/supplierResolver')

test('resolves supplier names to existing supplier ObjectIds', async () => {
  const supplierId = new mongoose.Types.ObjectId()
  const fakeSupplierModel = {
    findOne: async () => ({ _id: supplierId }),
  }

  const resolved = await resolveSupplierId('FreshFarm Dairy', fakeSupplierModel)

  assert.ok(resolved instanceof mongoose.Types.ObjectId)
  assert.ok(resolved.equals(supplierId))
})

test('creates a new supplier record when the supplier name is missing', async () => {
  const createdSupplierId = new mongoose.Types.ObjectId()
  const fakeSupplierModel = {
    findOne: async () => null,
    create: async ({ name }) => ({ _id: createdSupplierId, name }),
  }

  const resolved = await resolveSupplierId('Unknown Supplier', fakeSupplierModel)

  assert.ok(resolved instanceof mongoose.Types.ObjectId)
  assert.ok(resolved.equals(createdSupplierId))
})
