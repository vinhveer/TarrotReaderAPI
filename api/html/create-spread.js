/**
 * Create Spread - Display card selection from 1-72
 */

const { createSpread } = require('../spread');

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
        // Generate new spread
        const spreadResult = createSpread();
        
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers.host;
        const baseUrl = `${protocol}://${host}`;
        
        res.setHeader('Content-Type', 'text/html');
        
        // Generate href links from 1 to 72
        let cardLinks = '';
        for (let i = 1; i <= 72; i++) {
            cardLinks += `<a href="${baseUrl}/api/html/create-spread/${i}?seed=${spreadResult.seed}">${i}</a> `;
        }
        
        const html = `<!DOCTYPE html>
<html>
<head><title>Create Spread</title></head>
<body>
    <h3>ID: ${spreadResult.seed}</h3>
    <p>Pick numbers (1-72):</p>
    ${cardLinks}
</body>
</html>`;
        
        res.status(200).send(html);
    } catch (error) {
        const errorHtml = `<!DOCTYPE html>
<html>
<head><title>Error</title></head>
<body>
    <h1>Error Creating Spread</h1>
    <p>${error.message}</p>
    <p><a href="${req.headers.referer || '/api/html/'}">Go Back</a></p>
</body>
</html>`;
        res.status(500).send(errorHtml);
    }
};
