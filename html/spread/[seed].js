/**
 * HTML endpoint for reading tarot spreads by seed
 * Returns pure HTML for GPT consumption
 */

const fs = require('fs');
const path = require('path');
const { generateSpreadFromSeed } = require('../../api/spread');

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
        meaning_reversed: meaningReversed,
        number: card.number,
        arcana: card.arcana,
        suit: card.suit
    };
}

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'text/html');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    try {
        // Extract seed from URL
        const { seed } = req.query;
        const { choose } = req.query;
        
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
        
        // Get base URL
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers.host;
        const baseUrl = `${protocol}://${host}`;
        
        let html = `<!DOCTYPE html>
<html>
<head>
    <title>Tarot Reading - Seed: ${cleanSeed}</title>
</head>
<body>
    <h1>Tarot Reading</h1>
    
    <h2>Spread Information</h2>
    <p><strong>Seed:</strong> ${cleanSeed}</p>
    <p><strong>Total Cards in Deck:</strong> ${deck.length}</p>
    <p><strong>Requested Cards:</strong> ${choose || 'none specified'}</p>
    <p><strong>Valid Card Positions:</strong> ${validIndices.length > 0 ? validIndices.join(', ') : 'none'}</p>
`;

        if (validIndices.length === 0) {
            html += `
    <h2>No Cards Selected</h2>
    <p>No valid card indices were provided. Please specify which cards to draw using the "choose" parameter.</p>
    
    <h3>Examples</h3>
    <ul>
        <li><a href="${baseUrl}/html/spread/${cleanSeed}?choose=0">Draw first card (position 0)</a></li>
        <li><a href="${baseUrl}/html/spread/${cleanSeed}?choose=0,1,2">Draw three cards (positions 0, 1, 2)</a></li>
        <li><a href="${baseUrl}/html/spread/${cleanSeed}?choose=0,1,2,3,4,5,6,7,8,9">Draw ten cards (Celtic Cross)</a></li>
    </ul>
    
    <h3>Instructions</h3>
    <p>Add "?choose=X,Y,Z" to the URL where X, Y, Z are card positions from 0 to 71.</p>
`;
        } else {
            html += `
    <h2>Your Cards</h2>
`;
            
            // Get chosen cards
            validIndices.forEach((deckIndex, cardPosition) => {
                const deckCard = deck[deckIndex];
                const cardIndex = deckCard.index;
                const orientation = deckCard.orientation;
                
                // Get card from tarot data
                if (cardIndex >= 0 && cardIndex < tarot.cards.length) {
                    const rawCard = tarot.cards[cardIndex];
                    const normalizedCard = normalizeCard(rawCard);
                    
                    // Apply orientation
                    const meaning = orientation === 1 
                        ? normalizedCard.meaning_upright 
                        : normalizedCard.meaning_reversed;
                    
                    const orientationText = orientation === 1 ? 'Upright' : 'Reversed';
                    
                    html += `
    <div>
        <h3>Card ${cardPosition + 1}: ${normalizedCard.name}</h3>
        <p><strong>Position in Spread:</strong> ${deckIndex}</p>
        <p><strong>Orientation:</strong> ${orientationText}</p>
        <p><strong>Arcana:</strong> ${normalizedCard.arcana || 'Unknown'}</p>
        <p><strong>Suit:</strong> ${normalizedCard.suit || 'N/A'}</p>
        <p><strong>Number:</strong> ${normalizedCard.number || 'N/A'}</p>
        <p><strong>Meaning:</strong> ${meaning}</p>
    </div>
    <hr>
`;
                }
            });
            
            html += `
    <h3>Additional Actions</h3>
    <ul>
        <li><a href="${baseUrl}/html/spread/${cleanSeed}?choose=0,1,2,3,4,5,6,7,8,9">Draw 10 cards (Celtic Cross)</a></li>
        <li><a href="${baseUrl}/html/spread/${cleanSeed}?choose=${Array.from({length: 22}, (_, i) => i).join(',')}">Draw all Major Arcana positions</a></li>
    </ul>
`;
        }
        
        html += `
    <h2>Navigation</h2>
    <ul>
        <li><a href="${baseUrl}/html/create-spread">Create New Spread</a></li>
        <li><a href="${baseUrl}/html/index">API Documentation</a></li>
        <li><a href="${baseUrl}/api/spread/${cleanSeed}?choose=${choose || '0,1,2'}">View JSON Version</a></li>
    </ul>
    
    <h2>About This Reading</h2>
    <p>This tarot reading was generated using seed "${cleanSeed}" which deterministically creates a shuffled 72-card deck. The same seed will always produce the same card order and orientations, making readings reproducible and shareable.</p>
    
</body>
</html>`;
        
        res.status(200).send(html);
        
    } catch (error) {
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers.host;
        const baseUrl = `${protocol}://${host}`;
        
        const errorHtml = `<!DOCTYPE html>
<html>
<head><title>Error Reading Spread</title></head>
<body>
    <h1>Error Reading Spread</h1>
    <p><strong>Error:</strong> ${error.message}</p>
    <p><strong>Seed:</strong> ${req.query.seed || 'not provided'}</p>
    
    <h2>Troubleshooting</h2>
    <ul>
        <li>Check that your seed is correct and complete</li>
        <li>Ensure the URL wasn't modified or corrupted</li>
        <li>Try creating a new spread if the seed is invalid</li>
    </ul>
    
    <h2>Actions</h2>
    <ul>
        <li><a href="${baseUrl}/html/create-spread">Create New Spread</a></li>
        <li><a href="${baseUrl}/html/index">Back to Documentation</a></li>
    </ul>
</body>
</html>`;
        res.status(400).send(errorHtml);
    }
};
