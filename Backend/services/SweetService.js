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
    
}

module.exports = SweetService;