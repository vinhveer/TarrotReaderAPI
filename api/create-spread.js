/**
 * Vercel API endpoint for creating new tarot spreads
 */

const { createSpread } = require('./spread');

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
        // Generate random spread
        const spreadResult = createSpread();
        
        // Get base URL for response
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers.host;
        const baseUrl = `${protocol}://${host}`;
        
        // Return response with seed directly (no JWT)
        const response = {
            seed: spreadResult.seed,
            deck_size: spreadResult.totalCards,
            url: `${baseUrl}/api/spread/${spreadResult.seed}?choose=0,1,2`,
            download_url: `${baseUrl}/api/spread/${spreadResult.seed}?choose=0,1,2&download=true`,
            raw_url: `${baseUrl}/api/spread/${spreadResult.seed}?choose=0,1,2&format=raw`
        };
        
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
