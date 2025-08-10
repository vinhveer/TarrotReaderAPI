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
            finalizeLinks += `<a href="${baseUrl}/api/html/spread/${seed}?choose=${i}" class="card-btn">${i}</a>`;
            if (i % 12 === 0) finalizeLinks += '<br>'; // New line every 12 cards
        }
        
        const html = `<!DOCTYPE html>
<html>
<head>
    <title>Lá Bài Đã Chọn - ${id}</title>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; max-width: 1000px; margin: 0 auto; padding: 20px; }
        .card-btn { 
            display: inline-block; 
            padding: 8px 12px; 
            margin: 2px; 
            background: #FF9800; 
            color: white; 
            text-decoration: none; 
            border-radius: 3px; 
            min-width: 25px; 
            text-align: center;
        }
        .card-btn:hover { background: #F57C00; }
        .info { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2196F3; }
        .back-btn { display: inline-block; padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px 10px 0; }
        .chosen-card { background: #4CAF50; color: white; padding: 20px; border-radius: 10px; text-align: center; font-size: 24px; margin: 20px 0; }
    </style>
</head>
<body>
    <h1>Lá Bài Đã Chọn</h1>
    
    <div class="chosen-card">
        <strong>Lá số: ${id}</strong>
    </div>
    
    <div class="info">
        <h3>Thông tin Spread:</h3>
        <p><strong>Spread ID:</strong> ${seed}</p>
        <p><strong>Lá đã chọn:</strong> ${id}</p>
    </div>
    
    <h2>Chốt các lá (href từ 1 đến 72):</h2>
    <p>Click vào số để chốt lá bài và xem kết quả:</p>
    
    <div style="text-align: center; margin: 20px 0;">
        ${finalizeLinks}
    </div>
    
    <div>
        <a href="${baseUrl}/api/html/create-spread?seed=${seed}" class="back-btn">← Chọn lá khác</a>
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
    <h1>Error</h1>
    <p>${error.message}</p>
    <p><a href="${req.headers.referer || '/api/html/'}">Go Back</a></p>
</body>
</html>`;
        res.status(500).send(errorHtml);
    }
};
