/**
 * Vercel API main endpoint
 * Provides API documentation and root route handling
 */

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
        // Get base URL for examples
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers.host;
        const baseUrl = `${protocol}://${host}`;
        
        const response = {
            message: 'Tarot Reader API - Ultra Compact Node.js Edition',
            version: '2.0.0',
            endpoints: {
                'create_spread': `${baseUrl}/api/create-spread`,
                'read_spread': `${baseUrl}/api/spread/{seed}?choose=0,1,2`
            },
            routes: [
                '/api/create-spread - Create new tarot spread',
                '/api/spread/{seed}?choose=0,1,2 - Read cards from spread',
                '/api/spread/{seed}?choose=0,1,2&format=raw - Pure JSON response',
                '/api/spread/{seed}?choose=0,1,2&download=true - Download JSON file'
            ],
            examples: [
                'Create: ' + baseUrl + '/api/create-spread',
                'Read: ' + baseUrl + '/api/spread/YOUR_SEED?choose=0,1,2',
                'JSON: ' + baseUrl + '/api/spread/YOUR_SEED?choose=0,1,2&format=raw',
                'Download: ' + baseUrl + '/api/spread/YOUR_SEED?choose=0,1,2&download=true'
            ],
            features: [
                'Ultra-compact seed-based URLs',
                'Deterministic card generation',
                'No JWT or encryption needed',
                'Multiple output formats (JSON, download)',
                'Full CORS support',
                'Serverless deployment ready'
            ]
        };
        
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
