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
});