/**
 * Vercel API endpoint for reading tarot spreads by seed
 */

const fs = require('fs');
const path = require('path');
const { generateSpreadFromSeed } = require('../spread');

// Cache tarot data
let tarotData = null;

/**
 * Load tarot.json data
 * @returns {Object} tarot data
 */
function loadTarotData() {
    if (tarotData) {
        return tarotData;
    }
    
    try {
        const filePath = path.join(process.cwd(), 'tarot.json');
        const rawData = fs.readFileSync(filePath, 'utf8');
        tarotData = JSON.parse(rawData);
        return tarotData;
    } catch (error) {
        throw new Error(`Error loading tarot data: ${error.message}`);
    }
}

/**
 * Normalize card data to standard format
 * @param {Object} card - raw card data
 * @returns {Object} normalized card data
 */
function normalizeCard(card) {
    let meaningUpright, meaningReversed;
    
    // Handle different tarot.json formats
    if (card.meaning_upright && card.meaning_reversed) {
        // Direct format
        meaningUpright = card.meaning_upright;
        meaningReversed = card.meaning_reversed;
    } else if (card.meanings && card.meanings.light && card.meanings.shadow) {
        // Complex format - join arrays into strings
        meaningUpright = Array.isArray(card.meanings.light) 
            ? card.meanings.light.join('. ') 
            : card.meanings.light;
        meaningReversed = Array.isArray(card.meanings.shadow) 
            ? card.meanings.shadow.join('. ') 
            : card.meanings.shadow;
    } else {
        // Fallback
        meaningUpright = "Positive energy and forward movement";
        meaningReversed = "Blocked energy or reversed meaning";
    }
    
    return {
        name: card.name,
        meaning_upright: meaningUpright,
        meaning_reversed: meaningReversed
    };
}

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    try {
        // Extract seed from URL
        const { seed } = req.query;
        const { choose, download, format } = req.query;
        
        // Load tarot data
        const tarot = loadTarotData();
        
        // Use seed directly (no JWT needed)
        if (!seed || typeof seed !== 'string') {
            throw new Error('Invalid or missing seed. Please create a new spread.');
        }
        
        // Clean seed (remove any URL artifacts)
        const cleanSeed = seed.trim();
        
        // Regenerate deck from seed
        const deck = generateSpreadFromSeed(cleanSeed, 72);
        
        // Verify deck generation worked
        if (!deck || deck.length !== 72) {
            throw new Error(`Deck generation failed. Seed: ${cleanSeed}, Generated: ${deck ? deck.length : 'null'} cards`);
        }
        
        // Parse choose parameter (comma-separated indices)
        const chosenIndices = choose
            ? choose.split(',').map(i => parseInt(i.trim(), 10))
            : [];
        
        // Validate chosen indices
        const validIndices = chosenIndices.filter(i => 
            !isNaN(i) && i >= 0 && i < deck.length
        );
        
        // Get chosen cards
        const chosen = validIndices.map(deckIndex => {
            const deckCard = deck[deckIndex];
            const cardIndex = deckCard.index;
            const orientation = deckCard.orientation;
            
            // Get card from tarot data
            if (cardIndex < 0 || cardIndex >= tarot.cards.length) {
                throw new Error(`Invalid card index: ${cardIndex}`);
            }
            
            const rawCard = tarot.cards[cardIndex];
            const normalizedCard = normalizeCard(rawCard);
            
            // Apply orientation
            const meaning = orientation === 1 
                ? normalizedCard.meaning_upright 
                : normalizedCard.meaning_reversed;
            
            return {
                name: normalizedCard.name,
                meaning: meaning,
                orientation: orientation === 1 ? 'upright' : 'reversed'
            };
        });
        
        const response = {
            chosen: chosen,
            ...(chosen.length === 0 && {
                info: {
                    total_cards: deck.length,
                    seed_used: cleanSeed,
                    choose_param: choose || 'not provided',
                    message: choose ? 'No valid card indices found' : 'Add ?choose=0,1,2 to select cards'
                }
            })
        };
        
        // Handle different response formats
        if (download === 'true') {
            // Set headers for download
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="tarot-${Date.now()}.json"`);
            res.status(200).json(response);
        } else if (format === 'raw') {
            // Pure JSON response
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json(response);
        } else {
            // Default JSON response
            res.status(200).json(response);
        }
        
    } catch (error) {
        const errorResponse = { error: error.message };
        res.status(400).json(errorResponse);
    }
};
