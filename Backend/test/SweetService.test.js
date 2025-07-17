const SweetService = require('../services/SweetService');
const Sweet = require('../models/Sweet');

describe('SweetService', () => {
    let sweetService;

    beforeEach(() => {
        sweetService = new SweetService();
    });

    // Add Sweet Tests
    test('should add a new sweet', () => {
        const sweet = new Sweet(1, 'Chocolate Bar', 'chocolate', 2.5, 10);
        sweetService.addSweet(sweet);
        expect(sweetService.getAllSweets()).toContainEqual(sweet);
    });

    test('should not add sweet with duplicate id', () => {
        const sweet1 = new Sweet(1, 'Chocolate Bar', 'chocolate', 2.5, 10);
        sweetService.addSweet(sweet1);
        const sweet2 = new Sweet(1, 'Candy', 'candy', 1.5, 20);
        expect(() => sweetService.addSweet(sweet2)).toThrow('Sweet with this ID already exists');
    });

    // Delete Sweet Tests
    test('should delete a sweet by id', () => {
        const sweet = new Sweet(1, 'Chocolate Bar', 'chocolate', 2.5, 10);
        sweetService.addSweet(sweet);
        sweetService.deleteSweet(1);
        expect(sweetService.getAllSweets()).not.toContainEqual(sweet);
    });

    test('should throw error when deleting non-existent sweet', () => {
        expect(() => sweetService.deleteSweet(999)).toThrow('Sweet not found');
    });

    // Search Tests
    test('should search sweets by name', () => {
        const sweet1 = new Sweet(1, 'Chocolate Bar', 'chocolate', 2.5, 10);
        const sweet2 = new Sweet(2, 'Gummy Bears', 'candy', 1.5, 20);
        sweetService.addSweet(sweet1);
        sweetService.addSweet(sweet2);
        
        const results = sweetService.searchSweets({ name: 'Chocolate' });
        expect(results).toContainEqual(sweet1);
        expect(results).not.toContainEqual(sweet2);
    });

    test('should search sweets by category', () => {
        const sweet1 = new Sweet(1, 'Chocolate Bar', 'chocolate', 2.5, 10);
        const sweet2 = new Sweet(2, 'Gummy Bears', 'candy', 1.5, 20);
        sweetService.addSweet(sweet1);
        sweetService.addSweet(sweet2);
        
        const results = sweetService.searchSweets({ category: 'candy' });
        expect(results).toContainEqual(sweet2);
        expect(results).not.toContainEqual(sweet1);
    });

    test('should search sweets by price range', () => {
        const sweet1 = new Sweet(1, 'Chocolate Bar', 'chocolate', 2.5, 10);
        const sweet2 = new Sweet(2, 'Gummy Bears', 'candy', 1.5, 20);
        const sweet3 = new Sweet(3, 'Cupcake', 'pastry', 3.0, 15);
        sweetService.addSweet(sweet1);
        sweetService.addSweet(sweet2);
        sweetService.addSweet(sweet3);
        
        const results = sweetService.searchSweets({ minPrice: 2.0, maxPrice: 2.75 });
        expect(results).toContainEqual(sweet1);
        expect(results).not.toContainEqual(sweet2);
        expect(results).not.toContainEqual(sweet3);
    });
});