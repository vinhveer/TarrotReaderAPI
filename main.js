/**
 * Main application logic
 * Handles routing and tarot card operations
 */

// Hardcoded secret for JWT (in production, this should be more secure)
const JWT_SECRET = 'tarot-reader-secret-2024';

// Global variable to store tarot data
let tarotData = null;

/**
 * Load tarot.json data
 * @returns {Promise<Object>} tarot data
 */
async function loadTarotData() {
    if (tarotData) {
        return tarotData;
    }
    
    try {
        const response = await fetch('./tarot.json');
        if (!response.ok) {
            throw new Error(`Failed to load tarot.json: ${response.status}`);
        }
        tarotData = await response.json();
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

/**
 * Handle create-spread route
 * @returns {Promise<string>} JSON response
 */
async function handleCreateSpread() {
    try {
        // Generate random spread
        const spreadResult = createSpread();
        
        // Create JWT payload
        const payload = {
            deck: spreadResult.deck,
            ts: Date.now()
        };
        
        // Create JWT token
        const token = await createJWT(payload, JWT_SECRET);
        
        // Return response
        const response = {
            token: token,
            deck_size: spreadResult.deck.length
        };
        
        return JSON.stringify(response);
    } catch (error) {
        return JSON.stringify({ error: error.message });
    }
}

/**
 * Handle spread/<token> route
 * @param {string} token - JWT token from URL
 * @param {string} chooseParam - choose parameter from query string
 * @returns {Promise<string>} JSON response
 */
async function handleSpreadRead(token, chooseParam) {
    try {
        // Load tarot data
        const tarot = await loadTarotData();
        
        // Verify JWT and get deck
        const payload = await verifyJWT(token, JWT_SECRET);
        const deck = payload.deck;
        
        if (!deck || !Array.isArray(deck)) {
            throw new Error('Invalid deck data in token');
        }
        
        // Parse choose parameter (comma-separated indices)
        const chosenIndices = chooseParam
            ? chooseParam.split(',').map(i => parseInt(i.trim(), 10))
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
            chosen: chosen
        };
        
        return JSON.stringify(response);
    } catch (error) {
        return JSON.stringify({ error: error.message });
    }
}

/**
 * Parse URL and route to appropriate handler
 */
async function handleRouting() {
    const pathname = window.location.pathname;
    const search = window.location.search;
    
    try {
        let result;
        
        if (pathname === '/create-spread') {
            // Create new spread
            result = await handleCreateSpread();
        } else if (pathname.startsWith('/spread/')) {
            // Read existing spread
            const token = pathname.substring('/spread/'.length);
            if (!token) {
                throw new Error('Missing token in URL');
            }
            
            // Parse query parameters
            const urlParams = new URLSearchParams(search);
            const chooseParam = urlParams.get('choose');
            
            result = await handleSpreadRead(token, chooseParam);
        } else {
            // Default route
            result = JSON.stringify({
                message: 'Tarot Reader API',
                routes: [
                    '/create-spread - Create new tarot spread',
                    '/spread/<token>?choose=0,1,2 - Read cards from spread'
                ]
            });
        }
        
        // Output result to page
        document.body.innerHTML = `<pre>${result}</pre>`;
        
    } catch (error) {
        const errorResult = JSON.stringify({ error: error.message });
        document.body.innerHTML = `<pre>${errorResult}</pre>`;
    }
}

/**
 * Initialize application when DOM is loaded
 */
if (!window.IS_TEST) {
    document.addEventListener('DOMContentLoaded', handleRouting);
}
