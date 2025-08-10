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
<head>
    <title>Tarot Reader - HTML Interface</title>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .btn { display: inline-block; padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .btn:hover { background: #45a049; }
    </style>
</head>
<body>
    <h1>Tarot Reader - HTML Interface</h1>
    
    <h2>Chào mừng đến với Tarot Reader</h2>
    <p>Bắt đầu tạo một spread mới để chọn các lá bài tarot.</p>
    
    <div>
        <a href="${baseUrl}/api/html/create-spread" class="btn">Create Spread (Tạo Spread Mới)</a>
    </div>
    
    <h3>Hướng dẫn sử dụng:</h3>
    <ol>
        <li>Click "Create Spread" để tạo spread mới</li>
        <li>Chọn các số từ 1-72 để chọn lá bài</li>
        <li>Tiếp tục cho đến khi hoàn thành việc chọn lá</li>
    </ol>
    
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
