require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Routes
app.get('/', (req, res) => {
    res.send('ClosetRush API is running...');
});

// Import Routes (we will create these next)
const productRoutes = require('./routes/products');
const statsRoutes = require('./routes/stats');
// const authRoutes = require('./routes/auth');

app.use('/api/products', productRoutes);
app.use('/api/stats', statsRoutes);
// app.use('/api/auth', authRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
