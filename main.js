/**
 * Main application logic
 * Handles routing and tarot card operations
 */

// No JWT needed - using seeds directly for ultra-compact URLs

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
        
        // Return response with seed directly (no JWT)
        const response = {
            seed: spreadResult.seed,
            deck_size: spreadResult.totalCards,
            url: `${window.location.origin}${window.location.pathname}#spread/${spreadResult.seed}?choose=0,1,2`
        };
        
        return JSON.stringify(response);
    } catch (error) {
        return JSON.stringify({ error: error.message });
    }
}

/**
 * Handle spread/<seed> route
 * @param {string} seed - seed string from URL
 * @param {string} chooseParam - choose parameter from query string
 * @returns {Promise<string>} JSON response
 */
async function handleSpreadRead(seed, chooseParam) {
    try {
        // Load tarot data
        const tarot = await loadTarotData();
        
        // Use seed directly (no JWT needed)
        if (!seed || typeof seed !== 'string') {
            throw new Error('Invalid or missing seed. Please create a new spread.');
        }
        
        // Clean seed (remove any URL artifacts)
        seed = seed.trim();
        
        // Regenerate deck from seed
        const deck = generateSpreadFromSeed(seed, 72);
        
        // Verify deck generation worked
        if (!deck || deck.length !== 72) {
            throw new Error(`Deck generation failed. Seed: ${seed}, Generated: ${deck ? deck.length : 'null'} cards`);
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
            chosen: chosen,
            ...(chosen.length === 0 && {
                info: {
                    total_cards: deck.length,
                    seed_used: seed,
                    choose_param: chooseParam || 'not provided',
                    message: chooseParam ? 'No valid card indices found' : 'Add ?choose=0,1,2 to select cards'
                }
            })
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
    const hash = window.location.hash.slice(1); // Remove # character
    const search = window.location.search;
    
    try {
        let result;
        
        if (hash === 'create-spread') {
            // Create new spread
            result = await handleCreateSpread();
        } else if (hash.startsWith('spread/')) {
            // Read existing spread
            let seedPart = hash.substring('spread/'.length);
            if (!seedPart) {
                throw new Error('Missing seed in URL');
            }
            
            // Split seed from any query parameters that might be in the hash
            const queryIndex = seedPart.indexOf('?');
            let seed, hashQuery = '';
            if (queryIndex !== -1) {
                seed = seedPart.substring(0, queryIndex);
                hashQuery = seedPart.substring(queryIndex + 1);
            } else {
                seed = seedPart;
            }
            
            // Parse query parameters from both URL search and hash
            const urlParams = new URLSearchParams(search);
            const hashParams = new URLSearchParams(hashQuery);
            
            // Priority: hash params > URL params
            const chooseParam = hashParams.get('choose') || urlParams.get('choose');
            
            result = await handleSpreadRead(seed, chooseParam);
        } else {
            // Default route or invalid route
            const currentUrl = window.location.href;
            const isSpreadUrl = hash.startsWith('spread/');
            
            result = JSON.stringify({
                message: 'Tarot Reader API - Ultra Compact Edition',
                ...(isSpreadUrl && {
                    error: 'Invalid spread URL. Please check your seed or create a new spread.',
                    troubleshooting: [
                        'Seed may be corrupted or incomplete',
                        'URL may have been modified',
                        'Create a new spread to get a fresh seed'
                    ]
                }),
                routes: [
                    '#create-spread - Create new tarot spread',
                    '#spread/<seed>?choose=0,1,2 - Read cards from spread'
                ],
                examples: [
                    'Try: ' + window.location.origin + window.location.pathname + '#create-spread',
                    'Then: ' + window.location.origin + window.location.pathname + '#spread/YOUR_SEED?choose=0,1,2'
                ]
            });
        }
        
        // Always output JSON to page
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
    window.addEventListener('hashchange', handleRouting);
}
