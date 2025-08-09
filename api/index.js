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
    
    // Check if HTML format is requested
    const { format } = req.query;
    
    try {
        // Get base URL for examples
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers.host;
        const baseUrl = `${protocol}://${host}`;
        
        if (format === 'html') {
            // Return HTML for GPT consumption
            res.setHeader('Content-Type', 'text/html');
            
            const html = `<!DOCTYPE html>
<html>
<head>
    <title>Tarot Reader API Documentation</title>
</head>
<body>
    <h1>Tarot Reader API - HTML Edition</h1>
    
    <h2>About</h2>
    <p>Ultra-compact tarot card API with seed-based spreads. This HTML version is optimized for GPT and AI consumption.</p>
    
    <h2>Endpoints</h2>
    
    <h3>Create New Spread</h3>
    <p><strong>URL:</strong> <a href="${baseUrl}/api/create-spread?format=html">${baseUrl}/api/create-spread?format=html</a></p>
    <p><strong>Method:</strong> GET</p>
    <p><strong>Description:</strong> Creates a new tarot spread with a unique seed</p>
    
    <h3>Read Cards from Spread</h3>
    <p><strong>URL:</strong> ${baseUrl}/api/spread/{seed}?choose=0,1,2&format=html</p>
    <p><strong>Method:</strong> GET</p>
    <p><strong>Description:</strong> Reads specific cards from a spread using the seed</p>
    <p><strong>Parameters:</strong></p>
    <ul>
        <li><strong>seed:</strong> The unique seed from create-spread</li>
        <li><strong>choose:</strong> Comma-separated card indices (0-71)</li>
        <li><strong>format:</strong> Set to "html" for HTML response</li>
    </ul>
    
    <h2>Examples</h2>
    <ol>
        <li>Visit: <a href="${baseUrl}/api/create-spread?format=html">${baseUrl}/api/create-spread?format=html</a></li>
        <li>Copy the seed from the response</li>
        <li>Visit: ${baseUrl}/api/spread/YOUR_SEED?choose=0,1,2&format=html</li>
    </ol>
    
    <h2>Features</h2>
    <ul>
        <li>Deterministic: Same seed always generates identical spread</li>
        <li>Ultra-compact: Minimal seed strings for short URLs</li>
        <li>No authentication required</li>
        <li>Full 72-card tarot deck</li>
        <li>Supports upright and reversed card orientations</li>
        <li>CORS enabled for cross-origin requests</li>
        <li>Both JSON and HTML formats available</li>
    </ul>
    
    <h2>Format Options</h2>
    <ul>
        <li><strong>JSON (default):</strong> ${baseUrl}/api/create-spread</li>
        <li><strong>HTML:</strong> ${baseUrl}/api/create-spread?format=html</li>
    </ul>
    
    <h2>Card Indices</h2>
    <p>Cards are numbered 0-71:</p>
    <ul>
        <li>0-21: Major Arcana (The Fool to The World)</li>
        <li>22-35: Cups (Ace to King)</li>
        <li>36-49: Pentacles (Ace to King)</li>
        <li>50-63: Swords (Ace to King)</li>
        <li>64-71: Wands (Ace to King)</li>
    </ul>
    
    <h2>Quick Test</h2>
    <p><a href="${baseUrl}/api/create-spread?format=html">Click here to create a new spread</a></p>
    
</body>
</html>`;
            
            res.status(200).send(html);
        } else {
            // Return JSON (default)
            const response = {
                message: 'Tarot Reader API - Ultra Compact Node.js Edition',
                version: '2.0.0',
                endpoints: {
                    'create_spread': `${baseUrl}/api/create-spread`,
                    'read_spread': `${baseUrl}/api/spread/{seed}?choose=0,1,2`,
                    'html_docs': `${baseUrl}/api/index?format=html`
                },
                routes: [
                    '/api/create-spread - Create new tarot spread (JSON)',
                    '/api/create-spread?format=html - Create new tarot spread (HTML)',
                    '/api/spread/{seed}?choose=0,1,2 - Read cards from spread (JSON)',
                    '/api/spread/{seed}?choose=0,1,2&format=html - Read cards from spread (HTML)',
                    '/api/spread/{seed}?choose=0,1,2&format=raw - Pure JSON response',
                    '/api/spread/{seed}?choose=0,1,2&download=true - Download JSON file'
                ],
                examples: [
                    'Create JSON: ' + baseUrl + '/api/create-spread',
                    'Create HTML: ' + baseUrl + '/api/create-spread?format=html',
                    'Read JSON: ' + baseUrl + '/api/spread/YOUR_SEED?choose=0,1,2',
                    'Read HTML: ' + baseUrl + '/api/spread/YOUR_SEED?choose=0,1,2&format=html',
                    'Download: ' + baseUrl + '/api/spread/YOUR_SEED?choose=0,1,2&download=true'
                ],
                features: [
                    'Ultra-compact seed-based URLs',
                    'Deterministic card generation',
                    'No JWT or encryption needed',
                    'Multiple output formats (JSON, HTML, download)',
                    'Full CORS support',
                    'Serverless deployment ready'
                ]
            };
            
            res.status(200).json(response);
        }
    } catch (error) {
        if (format === 'html') {
            const errorHtml = `<!DOCTYPE html>
<html>
<head><title>Error</title></head>
<body>
    <h1>Error</h1>
    <p>${error.message}</p>
</body>
</html>`;
            res.status(500).send(errorHtml);
        } else {
            res.status(500).json({ error: error.message });
        }
    }
};
