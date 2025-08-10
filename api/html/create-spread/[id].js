/**
 * Display chosen card ID and provide links to finalize the spread
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
        const { id } = req.query;
        const { seed } = req.query;
        
        if (!id || !seed) {
            throw new Error('Missing required parameters: id and seed');
        }
        
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers.host;
        const baseUrl = `${protocol}://${host}`;
        
        res.setHeader('Content-Type', 'text/html');
        
        // Generate href links from 1 to 72 for finalizing spread
        let finalizeLinks = '';
        for (let i = 1; i <= 72; i++) {
            finalizeLinks += `<a href="${baseUrl}/api/html/spread/${seed}?choose=${i}">${i}</a> `;
        }
        
        const html = `<!DOCTYPE html>
<html>
<head><title>Card ${id}</title></head>
<body>
    <h3>ID: ${seed}</h3>
    <p>Picked: ${id}</p>
    <p>Pick numbers (1-72):</p>
    ${finalizeLinks}
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
    <p><a href="${req.headers.referer || '/api/html/'}">Go Back</a></p>
</body>
</html>`;
        res.status(500).send(errorHtml);
    }
};
