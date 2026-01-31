const router = require('express').Router();
const Product = require('../models/Product');

// Get single product by ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a product
router.post('/', async (req, res) => {
    const product = new Product(req.body);
    try {
        const newProduct = await product.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Seed some data (dev only helper)
router.post('/seed', async (req, res) => {
    const seedData = [
        {
            name: "VINTAGE DIESEL JACKET",
            tag: "Archive",
            price: 20,
            owner: "alex_archive",
            distance: "0.8 MILES",
            bgClass: "bg-blue-900",
            category: "Jackets",
            available: true
        },
        {
            name: "ARCHIVE HELMUT LANG TOP",
            tag: "Designer",
            price: 35,
            owner: "helmut_god",
            distance: "0.3 MILES",
            bgClass: "bg-stone-900",
            category: "Tops",
            available: false
        },
        {
            name: "BALENCIAGA CROCS",
            tag: "Footwear",
            price: 45,
            owner: "demna_fan",
            distance: "2.1 MILES",
            bgClass: "bg-green-900",
            category: "Shoes",
            available: true
        },
        {
            name: "Y2K RIMLESS SHADES",
            tag: "Accessories",
            price: 15,
            owner: "y2k_princess",
            distance: "0.1 MILES",
            bgClass: "bg-pink-900",
            category: "Accessories",
            available: true
        },
        {
            name: "OVERSIZED VETEMENTS HOODIE",
            tag: "Streetwear",
            price: 55,
            owner: "hype_beast",
            distance: "1.5 MILES",
            bgClass: "bg-black",
            category: "Hoodies",
            available: false
        }
    ];

    try {
        await Product.deleteMany({}); // Clear existing
        const products = await Product.insertMany(seedData);
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
