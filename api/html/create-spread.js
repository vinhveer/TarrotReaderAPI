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
            cardLinks += `<a href="${baseUrl}/api/html/create-spread/${i}?seed=${spreadResult.seed}" class="card-btn">${i}</a>`;
            if (i % 12 === 0) cardLinks += '<br>'; // New line every 12 cards
        }
        
        const html = `<!DOCTYPE html>
<html>
<head>
    <title>Create Spread - Chọn Lá Bài</title>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; max-width: 1000px; margin: 0 auto; padding: 20px; }
        .card-btn { 
            display: inline-block; 
            padding: 8px 12px; 
            margin: 2px; 
            background: #2196F3; 
            color: white; 
            text-decoration: none; 
            border-radius: 3px; 
            min-width: 25px; 
            text-align: center;
        }
        .card-btn:hover { background: #1976D2; }
        .info { background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .back-btn { display: inline-block; padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
    </style>
</head>
<body>
    <h1>Create Spread</h1>
    
    <div class="info">
        <h3>Spread Information:</h3>
        <p><strong>ID:</strong> ${spreadResult.seed}</p>
        <p><strong>Created:</strong> ${new Date(spreadResult.timestamp).toISOString()}</p>
    </div>
    
    <h2>Chọn lá bài (từ 1 đến 72):</h2>
    <p>Click vào số để chọn lá bài tương ứng:</p>
    
    <div style="text-align: center; margin: 20px 0;">
        ${cardLinks}
    </div>
    
    <div>
        <a href="${baseUrl}/api/html/" class="back-btn">← Về trang chính</a>
    </div>
    
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
