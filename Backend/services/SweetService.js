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
}

module.exports = SweetService;