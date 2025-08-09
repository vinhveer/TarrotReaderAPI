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
    
    // Check if HTML format is requested
    const { format } = req.query;
    
    try {
        // Generate random spread
        const spreadResult = createSpread();
        
        // Get base URL for response
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers.host;
        const baseUrl = `${protocol}://${host}`;
        
        if (format === 'html') {
            // Return HTML for GPT consumption
            res.setHeader('Content-Type', 'text/html');
            
            const html = `<!DOCTYPE html>
<html>
<head>
    <title>New Tarot Spread Created</title>
</head>
<body>
    <h1>Tarot Spread Created Successfully</h1>
    
    <h2>Spread Information</h2>
    <p><strong>Seed:</strong> ${spreadResult.seed}</p>
    <p><strong>Total Cards:</strong> ${spreadResult.totalCards}</p>
    <p><strong>Created:</strong> ${new Date(spreadResult.timestamp).toISOString()}</p>
    
    <h2>How to Use This Spread</h2>
    <p>Use the seed above to draw cards from this spread. The seed ensures you always get the same shuffled deck.</p>
    
    <h3>Draw Cards URLs (HTML Format)</h3>
    <ul>
        <li><strong>Single card:</strong> <a href="${baseUrl}/api/spread/${spreadResult.seed}?choose=0&format=html">${baseUrl}/api/spread/${spreadResult.seed}?choose=0&format=html</a></li>
        <li><strong>Three cards:</strong> <a href="${baseUrl}/api/spread/${spreadResult.seed}?choose=0,1,2&format=html">${baseUrl}/api/spread/${spreadResult.seed}?choose=0,1,2&format=html</a></li>
        <li><strong>Celtic Cross (10 cards):</strong> <a href="${baseUrl}/api/spread/${spreadResult.seed}?choose=0,1,2,3,4,5,6,7,8,9&format=html">${baseUrl}/api/spread/${spreadResult.seed}?choose=0,1,2,3,4,5,6,7,8,9&format=html</a></li>
    </ul>
    
    <h3>JSON API Endpoints</h3>
    <ul>
        <li><strong>JSON:</strong> <a href="${baseUrl}/api/spread/${spreadResult.seed}?choose=0,1,2">${baseUrl}/api/spread/${spreadResult.seed}?choose=0,1,2</a></li>
        <li><strong>Download:</strong> <a href="${baseUrl}/api/spread/${spreadResult.seed}?choose=0,1,2&download=true">${baseUrl}/api/spread/${spreadResult.seed}?choose=0,1,2&download=true</a></li>
    </ul>
    
    <h2>Quick Actions</h2>
    <p><a href="${baseUrl}/api/spread/${spreadResult.seed}?choose=0,1,2&format=html">Draw 3 Cards Now (HTML)</a></p>
    <p><a href="${baseUrl}/api/create-spread?format=html">Create Another Spread</a></p>
    <p><a href="${baseUrl}/api/index?format=html">Back to Documentation</a></p>
    
    <h2>About Seeds</h2>
    <p>The seed "${spreadResult.seed}" is a unique identifier that deterministically generates a shuffled 72-card tarot deck. Every time you use this seed, you'll get the exact same card order and orientations.</p>
    
</body>
</html>`;
            
            res.status(200).send(html);
        } else {
            // Return JSON (default)
            const response = {
                seed: spreadResult.seed,
                deck_size: spreadResult.totalCards,
                url: `${baseUrl}/api/spread/${spreadResult.seed}?choose=0,1,2`,
                html_url: `${baseUrl}/api/spread/${spreadResult.seed}?choose=0,1,2&format=html`,
                download_url: `${baseUrl}/api/spread/${spreadResult.seed}?choose=0,1,2&download=true`,
                raw_url: `${baseUrl}/api/spread/${spreadResult.seed}?choose=0,1,2&format=raw`
            };
            
            res.status(200).json(response);
        }
    } catch (error) {
        if (format === 'html') {
            const errorHtml = `<!DOCTYPE html>
<html>
<head><title>Error Creating Spread</title></head>
<body>
    <h1>Error Creating Spread</h1>
    <p>${error.message}</p>
    <p><a href="${req.headers.referer || '/api/index?format=html'}">Go Back</a></p>
</body>
</html>`;
            res.status(500).send(errorHtml);
        } else {
            res.status(500).json({ error: error.message });
        }
    }
};
