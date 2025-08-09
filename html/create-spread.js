/**
 * HTML endpoint for creating new tarot spreads
 * Returns pure HTML for GPT consumption
 */

const { createSpread } = require('../api/spread');

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
        // Generate random spread
        const spreadResult = createSpread();
        
        // Get base URL for response
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers.host;
        const baseUrl = `${protocol}://${host}`;
        
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
    
    <h3>Draw Cards URLs</h3>
    <ul>
        <li><strong>Single card:</strong> <a href="${baseUrl}/html/spread/${spreadResult.seed}?choose=0">${baseUrl}/html/spread/${spreadResult.seed}?choose=0</a></li>
        <li><strong>Three cards:</strong> <a href="${baseUrl}/html/spread/${spreadResult.seed}?choose=0,1,2">${baseUrl}/html/spread/${spreadResult.seed}?choose=0,1,2</a></li>
        <li><strong>Celtic Cross (10 cards):</strong> <a href="${baseUrl}/html/spread/${spreadResult.seed}?choose=0,1,2,3,4,5,6,7,8,9">${baseUrl}/html/spread/${spreadResult.seed}?choose=0,1,2,3,4,5,6,7,8,9</a></li>
    </ul>
    
    <h3>API Endpoints (JSON)</h3>
    <ul>
        <li><strong>JSON API:</strong> <a href="${baseUrl}/api/spread/${spreadResult.seed}?choose=0,1,2">${baseUrl}/api/spread/${spreadResult.seed}?choose=0,1,2</a></li>
    </ul>
    
    <h2>Quick Actions</h2>
    <p><a href="${baseUrl}/html/spread/${spreadResult.seed}?choose=0,1,2">Draw 3 Cards Now</a></p>
    <p><a href="${baseUrl}/html/create-spread">Create Another Spread</a></p>
    <p><a href="${baseUrl}/html/index">Back to Documentation</a></p>
    
    <h2>About Seeds</h2>
    <p>The seed "${spreadResult.seed}" is a unique identifier that deterministically generates a shuffled 72-card tarot deck. Every time you use this seed, you'll get the exact same card order and orientations.</p>
    
</body>
</html>`;
        
        res.status(200).send(html);
    } catch (error) {
        const errorHtml = `<!DOCTYPE html>
<html>
<head><title>Error Creating Spread</title></head>
<body>
    <h1>Error Creating Spread</h1>
    <p>${error.message}</p>
    <p><a href="${req.headers.referer || '/html/index'}">Go Back</a></p>
</body>
</html>`;
        res.status(500).send(errorHtml);
    }
};
