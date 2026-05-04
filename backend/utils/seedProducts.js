const dotenv = require('dotenv')
const mongoose = require('mongoose')
const Product = require('../models/Product')
const Category = require('../models/Category')
const User = require('../models/User')

// dotenv.config()
dotenv.config({ path: require('path').resolve(__dirname, '../.env') })
const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('MongoDB connected...')

    // Get admin user
    const admin = await User.findOne({ role: 'admin' })
    if (!admin) {
      console.error('No admin found. Run: npm run seed first')
      process.exit(1)
    }

    // ── STEP 1: Create Categories ──────────────────────────────
    console.log('Creating categories...')

    const categoryData = [
      { name: 'Dairy & Eggs',        description: 'Milk, cheese, butter, yoghurt and eggs' },
      { name: 'Bakery',              description: 'Bread, cakes, pastries and baked goods' },
      { name: 'Meat & Poultry',      description: 'Fresh and processed meat products' },
      { name: 'Seafood',             description: 'Fresh and frozen fish and seafood' },
      { name: 'Fruits & Vegetables', description: 'Fresh produce and salads' },
      { name: 'Beverages',           description: 'Juices, soft drinks, water and energy drinks' },
      { name: 'Snacks & Confectionery', description: 'Chips, biscuits, chocolates and sweets' },
      { name: 'Frozen Foods',        description: 'Frozen meals, ice cream and frozen vegetables' },
      { name: 'Pharmaceuticals',     description: 'Over-the-counter medicines and health products' },
      { name: 'Condiments & Sauces', description: 'Ketchup, mayonnaise, dressings and spreads' },
    ]

    // Clear existing categories and products
    await Product.deleteMany({})
    await Category.deleteMany({})
    console.log('Cleared existing products and categories')

    const categories = {}
    for (const cat of categoryData) {
      const created = await Category.create({ ...cat, createdBy: admin._id })
      categories[cat.name] = created._id
      console.log(`  ✓ Category: ${cat.name}`)
    }

    // ── STEP 2: Date helpers ───────────────────────────────────
    const daysFromNow = (days) => {
      const d = new Date()
      d.setDate(d.getDate() + days)
      return d
    }

    // ── STEP 3: Products ───────────────────────────────────────
    // Status breakdown:
    //   EXPIRED       → expiryDate in the past
    //   EXPIRING SOON → expiryDate within next 7 days
    //   VALID         → expiryDate more than 7 days away

    const products = [

      // ── DAIRY & EGGS ──────────────────────────────────────────
      {
        name: 'Full Cream Milk 2L',
        quantity: 120,
        category: categories['Dairy & Eggs'],
        expiryDate: daysFromNow(5),        // expiring soon
        supplier: 'FreshFarm Dairy',
        description: 'Full cream pasteurised milk, 2 litre carton',
      },
      {
        name: 'Skimmed Milk 1L',
        quantity: 80,
        category: categories['Dairy & Eggs'],
        expiryDate: daysFromNow(-3),       // expired
        supplier: 'FreshFarm Dairy',
        description: 'Skimmed pasteurised milk, 1 litre carton',
      },
      {
        name: 'Greek Yoghurt 500g',
        quantity: 60,
        category: categories['Dairy & Eggs'],
        expiryDate: daysFromNow(3),        // expiring soon
        supplier: 'Alpine Dairy Co.',
        description: 'Plain Greek-style yoghurt, 500g tub',
      },
      {
        name: 'Cheddar Cheese 400g',
        quantity: 45,
        category: categories['Dairy & Eggs'],
        expiryDate: daysFromNow(30),       // valid
        supplier: 'Alpine Dairy Co.',
        description: 'Mature cheddar cheese block, 400g',
      },
      {
        name: 'Salted Butter 250g',
        quantity: 90,
        category: categories['Dairy & Eggs'],
        expiryDate: daysFromNow(60),       // valid
        supplier: 'Golden Creamery',
        description: 'Salted butter, 250g block',
      },
      {
        name: 'Free Range Eggs x12',
        quantity: 200,
        category: categories['Dairy & Eggs'],
        expiryDate: daysFromNow(14),       // valid
        supplier: 'Sunshine Farms',
        description: 'Large free range eggs, pack of 12',
      },
      {
        name: 'Strawberry Yoghurt 150g',
        quantity: 30,
        category: categories['Dairy & Eggs'],
        expiryDate: daysFromNow(-1),       // expired
        supplier: 'Alpine Dairy Co.',
        description: 'Strawberry flavoured yoghurt, 150g cup',
      },
      {
        name: 'Whipping Cream 250ml',
        quantity: 40,
        category: categories['Dairy & Eggs'],
        expiryDate: daysFromNow(6),        // expiring soon
        supplier: 'Golden Creamery',
        description: 'Double whipping cream, 250ml carton',
      },

      // ── BAKERY ────────────────────────────────────────────────
      {
        name: 'Sliced White Bread 700g',
        quantity: 150,
        category: categories['Bakery'],
        expiryDate: daysFromNow(4),        // expiring soon
        supplier: 'Sunrise Bakery',
        description: 'Soft sliced white bread, 700g loaf',
      },
      {
        name: 'Whole Wheat Bread 600g',
        quantity: 90,
        category: categories['Bakery'],
        expiryDate: daysFromNow(-2),       // expired
        supplier: 'Sunrise Bakery',
        description: 'Whole wheat sliced bread, 600g loaf',
      },
      {
        name: 'Croissants x4',
        quantity: 60,
        category: categories['Bakery'],
        expiryDate: daysFromNow(2),        // expiring soon
        supplier: 'Le Petit Boulangerie',
        description: 'Butter croissants, pack of 4',
      },
      {
        name: 'Chocolate Muffins x6',
        quantity: 45,
        category: categories['Bakery'],
        expiryDate: daysFromNow(7),        // expiring soon (exactly 7)
        supplier: 'Le Petit Boulangerie',
        description: 'Double chocolate chip muffins, pack of 6',
      },
      {
        name: 'Sourdough Loaf 800g',
        quantity: 35,
        category: categories['Bakery'],
        expiryDate: daysFromNow(21),       // valid
        supplier: 'Artisan Breads Ltd',
        description: 'Traditional sourdough loaf, 800g',
      },
      {
        name: 'Dinner Rolls x8',
        quantity: 70,
        category: categories['Bakery'],
        expiryDate: daysFromNow(-5),       // expired
        supplier: 'Sunrise Bakery',
        description: 'Soft white dinner rolls, pack of 8',
      },

      // ── MEAT & POULTRY ────────────────────────────────────────
      {
        name: 'Chicken Breast 500g',
        quantity: 85,
        category: categories['Meat & Poultry'],
        expiryDate: daysFromNow(3),        // expiring soon
        supplier: 'Prime Cuts Meats',
        description: 'Boneless skinless chicken breast fillets, 500g',
      },
      {
        name: 'Beef Mince 500g',
        quantity: 70,
        category: categories['Meat & Poultry'],
        expiryDate: daysFromNow(-4),       // expired
        supplier: 'Prime Cuts Meats',
        description: 'Lean beef mince, 500g pack',
      },
      {
        name: 'Pork Sausages x8',
        quantity: 55,
        category: categories['Meat & Poultry'],
        expiryDate: daysFromNow(5),        // expiring soon
        supplier: 'Country Farm Meats',
        description: 'Traditional pork sausages, 8 pack',
      },
      {
        name: 'Smoked Bacon 200g',
        quantity: 40,
        category: categories['Meat & Poultry'],
        expiryDate: daysFromNow(18),       // valid
        supplier: 'Country Farm Meats',
        description: 'Smoked back bacon rashers, 200g',
      },
      {
        name: 'Whole Chicken 1.5kg',
        quantity: 30,
        category: categories['Meat & Poultry'],
        expiryDate: daysFromNow(4),        // expiring soon
        supplier: 'Sunrise Poultry',
        description: 'Fresh whole chicken, approx. 1.5kg',
      },
      {
        name: 'Turkey Slices 150g',
        quantity: 65,
        category: categories['Meat & Poultry'],
        expiryDate: daysFromNow(25),       // valid
        supplier: 'Prime Cuts Meats',
        description: 'Cooked turkey breast slices, 150g',
      },

      // ── SEAFOOD ───────────────────────────────────────────────
      {
        name: 'Atlantic Salmon Fillet 300g',
        quantity: 40,
        category: categories['Seafood'],
        expiryDate: daysFromNow(2),        // expiring soon
        supplier: 'Ocean Fresh Ltd',
        description: 'Fresh Atlantic salmon fillet, 300g',
      },
      {
        name: 'Tuna Steak 250g',
        quantity: 35,
        category: categories['Seafood'],
        expiryDate: daysFromNow(-2),       // expired
        supplier: 'Ocean Fresh Ltd',
        description: 'Fresh yellowfin tuna steak, 250g',
      },
      {
        name: 'Tiger Prawns 400g',
        quantity: 50,
        category: categories['Seafood'],
        expiryDate: daysFromNow(45),       // valid (frozen)
        supplier: 'Deep Sea Traders',
        description: 'Frozen raw tiger prawns, peeled and deveined, 400g',
      },
      {
        name: 'Cod Fillets 500g',
        quantity: 25,
        category: categories['Seafood'],
        expiryDate: daysFromNow(6),        // expiring soon
        supplier: 'Ocean Fresh Ltd',
        description: 'Skinless cod fillets, 500g',
      },

      // ── FRUITS & VEGETABLES ───────────────────────────────────
      {
        name: 'Gala Apples 1kg',
        quantity: 200,
        category: categories['Fruits & Vegetables'],
        expiryDate: daysFromNow(10),       // valid
        supplier: 'Green Valley Produce',
        description: 'Fresh Gala apples, 1kg bag',
      },
      {
        name: 'Ripe Bananas 1kg',
        quantity: 180,
        category: categories['Fruits & Vegetables'],
        expiryDate: daysFromNow(4),        // expiring soon
        supplier: 'Tropical Imports Co.',
        description: 'Fresh bananas, approximately 6-7 per kg',
      },
      {
        name: 'Vine Tomatoes 500g',
        quantity: 120,
        category: categories['Fruits & Vegetables'],
        expiryDate: daysFromNow(-1),       // expired
        supplier: 'Green Valley Produce',
        description: 'Vine ripened tomatoes, 500g pack',
      },
      {
        name: 'Baby Spinach 200g',
        quantity: 75,
        category: categories['Fruits & Vegetables'],
        expiryDate: daysFromNow(3),        // expiring soon
        supplier: 'Fresh Leaf Farms',
        description: 'Washed and ready to eat baby spinach, 200g',
      },
      {
        name: 'White Onions 2kg',
        quantity: 300,
        category: categories['Fruits & Vegetables'],
        expiryDate: daysFromNow(90),       // valid
        supplier: 'Green Valley Produce',
        description: 'White cooking onions, 2kg mesh bag',
      },
      {
        name: 'Strawberries 400g',
        quantity: 60,
        category: categories['Fruits & Vegetables'],
        expiryDate: daysFromNow(5),        // expiring soon
        supplier: 'Berry Bliss Farms',
        description: 'Fresh strawberries, 400g punnet',
      },
      {
        name: 'Iceberg Lettuce',
        quantity: 80,
        category: categories['Fruits & Vegetables'],
        expiryDate: daysFromNow(-3),       // expired
        supplier: 'Fresh Leaf Farms',
        description: 'Fresh iceberg lettuce head',
      },
      {
        name: 'Seedless Grapes 500g',
        quantity: 95,
        category: categories['Fruits & Vegetables'],
        expiryDate: daysFromNow(12),       // valid
        supplier: 'Tropical Imports Co.',
        description: 'Red seedless grapes, 500g punnet',
      },

      // ── BEVERAGES ─────────────────────────────────────────────
      {
        name: 'Orange Juice 1L',
        quantity: 150,
        category: categories['Beverages'],
        expiryDate: daysFromNow(8),        // valid
        supplier: 'SunDrinks Ltd',
        description: 'Freshly squeezed orange juice, 1 litre carton',
      },
      {
        name: 'Sparkling Water 6-pack',
        quantity: 200,
        category: categories['Beverages'],
        expiryDate: daysFromNow(180),      // valid
        supplier: 'AquaPure',
        description: 'Sparkling mineral water, 6 x 500ml bottles',
      },
      {
        name: 'Cola 2L',
        quantity: 300,
        category: categories['Beverages'],
        expiryDate: daysFromNow(120),      // valid
        supplier: 'FizzyCo Beverages',
        description: 'Classic cola flavoured fizzy drink, 2 litre bottle',
      },
      {
        name: 'Apple & Mango Juice 300ml',
        quantity: 45,
        category: categories['Beverages'],
        expiryDate: daysFromNow(6),        // expiring soon
        supplier: 'SunDrinks Ltd',
        description: 'Mixed fruit juice drink, 300ml bottle',
      },
      {
        name: 'Energy Drink 250ml',
        quantity: 80,
        category: categories['Beverages'],
        expiryDate: daysFromNow(-7),       // expired
        supplier: 'PowerUp Drinks',
        description: 'Original energy drink, 250ml can',
      },
      {
        name: 'Green Tea 500ml',
        quantity: 110,
        category: categories['Beverages'],
        expiryDate: daysFromNow(30),       // valid
        supplier: 'Zen Beverages',
        description: 'Unsweetened green tea, 500ml bottle',
      },

      // ── SNACKS & CONFECTIONERY ────────────────────────────────
      {
        name: 'Salted Crisps 150g',
        quantity: 250,
        category: categories['Snacks & Confectionery'],
        expiryDate: daysFromNow(90),       // valid
        supplier: 'CrunchTime Snacks',
        description: 'Classic salted potato crisps, 150g sharing bag',
      },
      {
        name: 'Milk Chocolate Bar 100g',
        quantity: 180,
        category: categories['Snacks & Confectionery'],
        expiryDate: daysFromNow(180),      // valid
        supplier: 'ChocWorld Ltd',
        description: 'Smooth milk chocolate bar, 100g',
      },
      {
        name: 'Mixed Nuts 200g',
        quantity: 120,
        category: categories['Snacks & Confectionery'],
        expiryDate: daysFromNow(7),        // expiring soon
        supplier: 'NutriSnacks',
        description: 'Roasted salted mixed nuts, 200g resealable bag',
      },
      {
        name: 'Digestive Biscuits 400g',
        quantity: 95,
        category: categories['Snacks & Confectionery'],
        expiryDate: daysFromNow(-10),      // expired
        supplier: 'Biscuit House',
        description: 'Wholemeal digestive biscuits, 400g pack',
      },
      {
        name: 'Gummy Bears 250g',
        quantity: 140,
        category: categories['Snacks & Confectionery'],
        expiryDate: daysFromNow(200),      // valid
        supplier: 'SweeTime Confectionery',
        description: 'Assorted fruit flavoured gummy bears, 250g bag',
      },
      {
        name: 'Popcorn Butter 80g',
        quantity: 85,
        category: categories['Snacks & Confectionery'],
        expiryDate: daysFromNow(5),        // expiring soon
        supplier: 'CrunchTime Snacks',
        description: 'Butter flavoured microwave popcorn, 80g bag',
      },

      // ── FROZEN FOODS ─────────────────────────────────────────
      {
        name: 'Frozen Peas 900g',
        quantity: 160,
        category: categories['Frozen Foods'],
        expiryDate: daysFromNow(365),      // valid
        supplier: 'FrostFresh Foods',
        description: 'Garden peas, individually quick frozen, 900g bag',
      },
      {
        name: 'Vanilla Ice Cream 2L',
        quantity: 70,
        category: categories['Frozen Foods'],
        expiryDate: daysFromNow(180),      // valid
        supplier: 'Chill & Freeze',
        description: 'Classic vanilla ice cream, 2 litre tub',
      },
      {
        name: 'Beef Lasagne 450g',
        quantity: 55,
        category: categories['Frozen Foods'],
        expiryDate: daysFromNow(4),        // expiring soon
        supplier: 'ReadyMeal Express',
        description: 'Frozen beef lasagne ready meal, 450g',
      },
      {
        name: 'Chicken Nuggets 500g',
        quantity: 90,
        category: categories['Frozen Foods'],
        expiryDate: daysFromNow(-8),       // expired
        supplier: 'FrostFresh Foods',
        description: 'Breaded chicken nuggets, 500g bag',
      },
      {
        name: 'Fish Fingers x10',
        quantity: 75,
        category: categories['Frozen Foods'],
        expiryDate: daysFromNow(240),      // valid
        supplier: 'Ocean Fresh Ltd',
        description: 'Crispy battered fish fingers, pack of 10',
      },
      {
        name: 'Frozen Margherita Pizza',
        quantity: 40,
        category: categories['Frozen Foods'],
        expiryDate: daysFromNow(6),        // expiring soon
        supplier: 'ReadyMeal Express',
        description: 'Classic margherita frozen pizza, 350g',
      },

      // ── PHARMACEUTICALS ──────────────────────────────────────
      {
        name: 'Paracetamol 500mg x16',
        quantity: 200,
        category: categories['Pharmaceuticals'],
        expiryDate: daysFromNow(730),      // valid
        supplier: 'MediSupply Co.',
        description: 'Paracetamol tablets 500mg, pack of 16',
      },
      {
        name: 'Vitamin C 1000mg x30',
        quantity: 150,
        category: categories['Pharmaceuticals'],
        expiryDate: daysFromNow(5),        // expiring soon
        supplier: 'HealthPlus Pharma',
        description: 'Effervescent vitamin C tablets, 1000mg, 30 tablets',
      },
      {
        name: 'Ibuprofen 200mg x24',
        quantity: 180,
        category: categories['Pharmaceuticals'],
        expiryDate: daysFromNow(-15),      // expired
        supplier: 'MediSupply Co.',
        description: 'Ibuprofen tablets 200mg, pack of 24',
      },
      {
        name: 'Antacid Tablets x20',
        quantity: 90,
        category: categories['Pharmaceuticals'],
        expiryDate: daysFromNow(400),      // valid
        supplier: 'HealthPlus Pharma',
        description: 'Peppermint flavoured antacid chewable tablets, 20 pack',
      },
      {
        name: 'Multivitamin Gummies x60',
        quantity: 110,
        category: categories['Pharmaceuticals'],
        expiryDate: daysFromNow(3),        // expiring soon
        supplier: 'HealthPlus Pharma',
        description: 'Adult multivitamin gummies, 60 count',
      },
      {
        name: 'Cough Syrup 200ml',
        quantity: 55,
        category: categories['Pharmaceuticals'],
        expiryDate: daysFromNow(-6),       // expired
        supplier: 'MediSupply Co.',
        description: 'Dry cough relief syrup, 200ml bottle',
      },

      // ── CONDIMENTS & SAUCES ───────────────────────────────────
      {
        name: 'Tomato Ketchup 500g',
        quantity: 220,
        category: categories['Condiments & Sauces'],
        expiryDate: daysFromNow(365),      // valid
        supplier: 'Saucy Brands Ltd',
        description: 'Classic tomato ketchup, 500g squeeze bottle',
      },
      {
        name: 'Mayonnaise 400g',
        quantity: 130,
        category: categories['Condiments & Sauces'],
        expiryDate: daysFromNow(180),      // valid
        supplier: 'Saucy Brands Ltd',
        description: 'Full fat mayonnaise, 400g jar',
      },
      {
        name: 'Soy Sauce 150ml',
        quantity: 95,
        category: categories['Condiments & Sauces'],
        expiryDate: daysFromNow(6),        // expiring soon
        supplier: 'Eastern Flavours',
        description: 'Light soy sauce, 150ml bottle',
      },
      {
        name: 'Peanut Butter Smooth 340g',
        quantity: 85,
        category: categories['Condiments & Sauces'],
        expiryDate: daysFromNow(-12),      // expired
        supplier: 'NutriSnacks',
        description: 'Smooth peanut butter, 340g jar',
      },
      {
        name: 'Honey 500g',
        quantity: 100,
        category: categories['Condiments & Sauces'],
        expiryDate: daysFromNow(900),      // valid
        supplier: 'BeeSweet Natural',
        description: 'Pure natural honey, 500g jar',
      },
      {
        name: 'Caesar Salad Dressing 250ml',
        quantity: 60,
        category: categories['Condiments & Sauces'],
        expiryDate: daysFromNow(4),        // expiring soon
        supplier: 'Saucy Brands Ltd',
        description: 'Creamy Caesar salad dressing, 250ml bottle',
      },
    ]

    // ── STEP 4: Insert products ────────────────────────────────
    console.log('\nInserting products...')
    let inserted = 0

    for (const p of products) {
      // Calculate status based on expiry date
      const now = new Date()
      const daysLeft = Math.ceil((new Date(p.expiryDate) - now) / (1000 * 60 * 60 * 24))
      let status = 'valid'
      if (daysLeft < 0) status = 'expired'
      else if (daysLeft <= 7) status = 'expiring_soon'

      await Product.create({
        ...p,
        status,
        addedBy: admin._id,
      })
      inserted++
    }

    // ── STEP 5: Summary ────────────────────────────────────────
    const total     = await Product.countDocuments()
    const valid     = await Product.countDocuments({ status: 'valid' })
    const expiring  = await Product.countDocuments({ status: 'expiring_soon' })
    const expired   = await Product.countDocuments({ status: 'expired' })

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('  SEED COMPLETE')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`  Categories  : ${Object.keys(categories).length}`)
    console.log(`  Total       : ${total} products`)
    console.log(`  ✓ Valid     : ${valid}`)
    console.log(`  ⚠ Expiring  : ${expiring}`)
    console.log(`  ✕ Expired   : ${expired}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\nLogin at http://localhost:5173')
    console.log('Email    : admin@expiryalert.com')
    console.log('Password : admin123456\n')

    process.exit(0)
  } catch (error) {
    console.error('Seed error:', error.message)
    process.exit(1)
  }
}

seedProducts()