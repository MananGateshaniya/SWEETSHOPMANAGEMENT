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
}

module.exports = SweetService;