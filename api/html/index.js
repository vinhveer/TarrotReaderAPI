/**
 * HTML Interface Main Page
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
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers.host;
        const baseUrl = `${protocol}://${host}`;
        
        res.setHeader('Content-Type', 'text/html');
        
        const html = `<!DOCTYPE html>
<html>
<head><title>Tarot Reader</title></head>
<body>
    <h3>Tarot Reader</h3>
    <p><a href="${baseUrl}/api/html/create-spread">Create Spread</a></p>
</body>
</html>`;
        
        res.status(200).send(html);
    } catch (error) {
        const errorHtml = `<!DOCTYPE html>
<html>
<head><title>Error</title></head>
<body>
    <h1>Error</h1>
    <p>${error.message}</p>
</body>
</html>`;
        res.status(500).send(errorHtml);
    }
};
