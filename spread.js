/**
 * Tarot Spread Algorithm
 * Implements seeded random shuffling and spread generation
 */

/**
 * Seeded random number generator (Linear Congruential Generator)
 * @param {string} seed - seed string
 * @returns {Function} random function that returns 0-1
 */
function createSeededRandom(seed) {
    // Convert seed string to number
    let seedValue = 0;
    for (let i = 0; i < seed.length; i++) {
        seedValue = ((seedValue << 5) - seedValue + seed.charCodeAt(i)) & 0xffffffff;
    }
    seedValue = Math.abs(seedValue);
    
    return function() {
        seedValue = (seedValue * 9301 + 49297) % 233280;
        return seedValue / 233280;
    };
}

/**
 * Generate random integer between min and max (inclusive) using seeded random
 * @param {Function} randomFn - seeded random function
 * @param {number} min - minimum value
 * @param {number} max - maximum value
 * @returns {number} random integer
 */
function getSeededRandomInt(randomFn, min, max) {
    return Math.floor(randomFn() * (max - min + 1)) + min;
}

/**
 * Generate ultra-compact random seed (no security needed)
 * @returns {string} compact random seed string
 */
function generateSeed() {
    // Ultra compact: just timestamp + 2 random numbers
    const t = Date.now().toString(36);
    const r1 = Math.floor(Math.random() * 0xffffff).toString(36);
    const r2 = Math.floor(Math.random() * 0xffffff).toString(36);
    return `${t}${r1}${r2}`;
}

/**
 * Generate spread from seed (deterministic)
 * @param {string} seed - seed string for reproducible randomness
 * @param {number} deckSize - total number of cards (default 72)
 * @returns {Array} array of card objects with index and orientation
 */
function generateSpreadFromSeed(seed, deckSize = 72) {
    const random = createSeededRandom(seed);
    
    // Initialize deck with all cards in order
    let deck = [];
    for (let i = 0; i < deckSize; i++) {
        deck.push({ index: i, orientation: 1 });
    }
    
    // Seeded Fisher-Yates shuffle algorithm
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    // Additional shuffle passes for more randomness
    for (let pass = 0; pass < 3; pass++) {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
    }
    
    // Seeded orientation assignment
    for (let i = 0; i < deck.length; i++) {
        deck[i].orientation = random() < 0.5 ? 1 : -1;
    }
    
    return deck;
}

/**
 * Legacy function - now generates seed and calls generateSpreadFromSeed
 * @param {number} deckSize - total number of cards (default 72)
 * @returns {Array} array of card objects with index and orientation
 */
function generateRandomSpread(deckSize = 72) {
    const seed = generateSeed();
    return generateSpreadFromSeed(seed, deckSize);
}

/**
 * Create a new random spread with seed (memory optimized)
 * @returns {Object} object containing seed and metadata (deck generated on-demand)
 */
function createSpread() {
    const seed = generateSeed();
    
    // Don't store the full deck in memory - regenerate when needed
    return {
        seed: seed,
        totalCards: 72,
        timestamp: Date.now(),
        // Generate deck on-demand via getter to save memory
        get deck() {
            return generateSpreadFromSeed(this.seed, this.totalCards);
        },
        get shuffledCards() {
            return this.totalCards;
        }
    };
}
