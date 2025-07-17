// const express = require('express');
// const bodyParser = require('body-parser');
// const cors = require('cors'); 
// const SweetService = require('./services/SweetService');
// const Sweet = require('./models/Sweet');

// const app = express();
// const sweetService = new SweetService();
// app.use(cors()); 
// app.use(bodyParser.json());
// app.use(express.static('public'));

// // Add sample data for testing
// sweetService.addSweet(new Sweet(1, 'Chocolate Bar', 'chocolate', 2.5, 10));
// sweetService.addSweet(new Sweet(2, 'Gummy Bears', 'candy', 1.5, 20));
// sweetService.addSweet(new Sweet(3, 'Apple Pie', 'pastry', 3.0, 15));

// // Add sweet
// app.post('/sweets', (req, res) => {
//     try {
//         const { id, name, category, price, quantity } = req.body;
//         const sweet = new Sweet(id, name, category, price, quantity);
//         sweetService.addSweet(sweet);
//         res.status(201).json(sweet);
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// });

// // Get all sweets
// app.get('/sweets', (req, res) => {
//     const { sort } = req.query;
//     if (sort) {
//         res.json(sweetService.getSortedSweets(sort));
//     } else {
//         res.json(sweetService.getAllSweets());
//     }
// });

// const PORT = 3000;
// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });