const Sweet = require('../models/Sweet');

class SweetService {
    constructor() {
        this.sweets = [];
    }

    addSweet(sweet) {
        if (this.sweets.some(s => s.id === sweet.id)) {
            throw new Error('Sweet with this ID already exists');
        }
        this.sweets.push(sweet);
    }

    getAllSweets() {
        return [...this.sweets];
    }
    
    deleteSweet(id) {
        const index = this.sweets.findIndex(s => s.id === id);
        if (index === -1) {
            throw new Error('Sweet not found');
        }
        this.sweets.splice(index, 1);
    }

    searchSweets({ name, category, minPrice, maxPrice }) {
        return this.sweets.filter(sweet => {
            const nameMatch = !name || sweet.name.toLowerCase().includes(name.toLowerCase());
            const categoryMatch = !category || sweet.category.toLowerCase() === category.toLowerCase();
            const minPriceMatch = !minPrice || sweet.price >= minPrice;
            const maxPriceMatch = !maxPrice || sweet.price <= maxPrice;
            
            return nameMatch && categoryMatch && minPriceMatch && maxPriceMatch;
        });
    }

    getSortedSweets(sortBy) {
        const sorted = [...this.sweets];
        switch (sortBy) {
            case 'name':
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'category':
                sorted.sort((a, b) => a.category.localeCompare(b.category));
                break;
            case 'price':
                sorted.sort((a, b) => a.price - b.price);
                break;
            case 'quantity':
                sorted.sort((a, b) => a.quantity - b.quantity);
                break;
            default:
                // Default sort by ID
                sorted.sort((a, b) => a.id - b.id);
        }
        return sorted;
    }

    purchaseSweet(id, quantity) {
        const sweet = this.sweets.find(s => s.id === id);
        if (!sweet) {
            throw new Error('Sweet not found');
        }
        if (sweet.quantity < quantity) {
            throw new Error('Not enough stock');
        }
        sweet.quantity -= quantity;
    }

    restockSweet(id, quantity) {
        const sweet = this.sweets.find(s => s.id === id);
        if (!sweet) {
            throw new Error('Sweet not found');
        }
        sweet.quantity += quantity;
    }
}

module.exports = SweetService;