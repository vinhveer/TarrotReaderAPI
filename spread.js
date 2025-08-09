/**
 * Tarot Spread Algorithm
 * Implements random shuffling and spread generation
 */

/**
 * Generate random integer between min and max (inclusive)
 * @param {number} min - minimum value
 * @param {number} max - maximum value
 * @returns {number} random integer
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Advanced cryptographically-inspired shuffle algorithm
 * @param {number} deckSize - total number of cards (default 72)
 * @returns {Array} array of card objects with index and orientation
 */
function generateRandomSpread(deckSize = 72) {
    // Initialize deck with all cards in order
    let deck = [];
    for (let i = 0; i < deckSize; i++) {
        deck.push({ index: i, orientation: 1 });
    }
    
    // Fisher-Yates shuffle algorithm - guarantees no duplicates
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    // Additional shuffle passes for more randomness
    for (let pass = 0; pass < 3; pass++) {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
    }
    
    // Random orientation assignment
    for (let i = 0; i < deck.length; i++) {
        deck[i].orientation = Math.random() < 0.5 ? 1 : -1;
    }
    
    return deck;
}

/**
 * Create a new random spread
 * @returns {Object} object containing deck array and metadata
 */
function createSpread() {
    const deck = generateRandomSpread(72);
    
    return {
        deck: deck,
        totalCards: 72,
        shuffledCards: deck.length,
        timestamp: Date.now()
    };
}
