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
        const { finish } = req.query;
        
        if (!seed) {
            throw new Error('Missing required parameter: seed');
        }
        
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers.host;
        const baseUrl = `${protocol}://${host}`;
        
        res.setHeader('Content-Type', 'text/html');
        
        let cardResult = '';
        let chosenCards = [];
        
        // If choose parameter exists, process the selected cards
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
                    orientation: cardData.orientation === 1 ? 'Upright' : 'Reversed'
                };
            });
            
            // Only show card names when finish=true
            if (finish === 'true') {
                cardResult = chosenCards.map(card => `${card.name} (${card.orientation})`).join('<br>');
            }
        }
        
        // If finish=true, show only card names (minimal for AI)
        if (finish === 'true') {
            const html = `<!DOCTYPE html>
<html>
<head><title>Cards</title></head>
<body>
${cardResult}
</body>
</html>`;
            res.status(200).send(html);
            return;
        }
        
        // Generate continue selection links from 1 to 72
        let continueLinks = '';
        for (let i = 1; i <= 72; i++) {
            const currentChoices = choose ? choose.split(',') : [];
            const newChoices = [...currentChoices, i.toString()];
            const newChooseParam = newChoices.join(',');
            
            continueLinks += `<a href="${baseUrl}/api/html/spread/${seed}?choose=${newChooseParam}">${i}</a> `;
        }
        
        const html = `<!DOCTYPE html>
<html>
<head><title>Pick Cards</title></head>
<body>
    <h3>ID: ${seed}</h3>
    ${choose ? `<p>Picked: ${choose}</p>` : '<p>No cards picked</p>'}
    <p>Pick numbers (1-72):</p>
    ${continueLinks}
    ${choose ? `<p><a href="${baseUrl}/api/html/spread/${seed}?choose=${choose}&finish=true">FINISH</a></p>` : ''}
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
