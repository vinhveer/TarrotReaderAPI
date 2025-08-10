/**
 * Finalize card selection and continue the flow
 */

const { generateSpreadFromSeed } = require('../../spread');
const tarotData = require('../../../tarot.json');

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
        const { seed } = req.query;
        const { choose } = req.query;
        
        if (!seed) {
            throw new Error('Missing required parameter: seed');
        }
        
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers.host;
        const baseUrl = `${protocol}://${host}`;
        
        res.setHeader('Content-Type', 'text/html');
        
        let cardResult = '';
        let chosenCards = [];
        
        // If choose parameter exists, show the selected card
        if (choose) {
            const spread = generateSpreadFromSeed(seed, 72);
            const cardIndices = choose.split(',').map(index => parseInt(index.trim()) - 1); // Convert to 0-based
            
            chosenCards = cardIndices.map(cardIndex => {
                if (cardIndex < 0 || cardIndex >= spread.length) {
                    throw new Error(`Invalid card index: ${cardIndex + 1}`);
                }
                
                const cardData = spread[cardIndex];
                const card = tarotData.cards[cardData.index];
                
                return {
                    position: cardIndex + 1,
                    name: card.name,
                    meaning: cardData.orientation === 1 
                        ? (card.meanings.light ? card.meanings.light.join(', ') : 'Positive meaning') 
                        : (card.meanings.shadow ? card.meanings.shadow.join(', ') : 'Challenging meaning'),
                    orientation: cardData.orientation === 1 ? 'Upright' : 'Reversed',
                    description: card.fortune_telling ? card.fortune_telling.join(', ') : 'No description available'
                };
            });
            
            cardResult = chosenCards.map((card, index) => `
                <div class="card-result">
                    <h3>Lá ${card.position}: ${card.name}</h3>
                    <p><strong>Hướng:</strong> ${card.orientation}</p>
                    <p><strong>Ý nghĩa:</strong> ${card.meaning}</p>
                    <p><strong>Mô tả:</strong> ${card.description}</p>
                </div>
            `).join('');
        }
        
        // Generate continue selection links from 1 to 72
        let continueLinks = '';
        for (let i = 1; i <= 72; i++) {
            const currentChoices = choose ? choose.split(',') : [];
            const newChoices = [...currentChoices, i.toString()];
            const newChooseParam = newChoices.join(',');
            
            continueLinks += `<a href="${baseUrl}/api/html/spread/${seed}?choose=${newChooseParam}" class="card-btn">${i}</a>`;
            if (i % 12 === 0) continueLinks += '<br>';
        }
        
        const html = `<!DOCTYPE html>
<html>
<head>
    <title>Spread Result - ${seed}</title>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; max-width: 1000px; margin: 0 auto; padding: 20px; }
        .card-btn { 
            display: inline-block; 
            padding: 8px 12px; 
            margin: 2px; 
            background: #9C27B0; 
            color: white; 
            text-decoration: none; 
            border-radius: 3px; 
            min-width: 25px; 
            text-align: center;
        }
        .card-btn:hover { background: #7B1FA2; }
        .card-result { 
            background: #f9f9f9; 
            padding: 15px; 
            margin: 10px 0; 
            border-radius: 8px; 
            border-left: 4px solid #9C27B0; 
        }
        .info { background: #fff3e0; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #FF9800; }
        .back-btn { display: inline-block; padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px 10px 0; }
        .finish-btn { display: inline-block; padding: 15px 30px; background: #f44336; color: white; text-decoration: none; border-radius: 5px; margin: 20px 5px; font-size: 18px; }
    </style>
</head>
<body>
    <h1>Spread Result</h1>
    
    <div class="info">
        <h3>Thông tin Spread:</h3>
        <p><strong>Spread ID:</strong> ${seed}</p>
        ${choose ? `<p><strong>Lá đã chọn:</strong> ${choose}</p>` : '<p>Chưa chọn lá nào</p>'}
        <p><strong>Số lá đã chọn:</strong> ${chosenCards.length}</p>
    </div>
    
    ${cardResult ? `
        <h2>Kết quả các lá đã chọn:</h2>
        ${cardResult}
    ` : '<h2>Chưa có lá nào được chọn</h2>'}
    
    <h2>Tiếp tục chọn lá (từ 1 đến 72):</h2>
    <p>Click vào số để thêm lá bài vào spread:</p>
    
    <div style="text-align: center; margin: 20px 0;">
        ${continueLinks}
    </div>
    
    <div>
        ${chosenCards.length > 0 ? `<a href="${baseUrl}/api/html/spread/${seed}?choose=${choose}&finish=true" class="finish-btn">🏁 Hoàn thành Spread</a>` : ''}
        <a href="${baseUrl}/api/html/create-spread" class="back-btn">← Tạo Spread mới</a>
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
    <h1>Error Processing Spread</h1>
    <p>${error.message}</p>
    <p><a href="${req.headers.referer || '/api/html/'}">Go Back</a></p>
</body>
</html>`;
        res.status(500).send(errorHtml);
    }
};
