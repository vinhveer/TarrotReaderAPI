export default function handler(req, res) {
    const privacyHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Privacy Policy - Tarot Reader API</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { 
            color: #2c3e50; 
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
        }
        h2 { 
            color: #34495e; 
            margin-top: 30px; 
            margin-bottom: 15px;
        }
        .last-updated { 
            font-style: italic; 
            color: #666; 
            background: #f8f9fa;
            padding: 10px;
            border-radius: 4px;
        }
        .back-link { 
            display: inline-block; 
            margin-top: 30px; 
            padding: 10px 20px;
            background: #3498db;
            color: white; 
            text-decoration: none; 
            border-radius: 5px;
            transition: background 0.3s;
        }
        .back-link:hover { 
            background: #2980b9;
        }
        ul {
            padding-left: 20px;
        }
        li {
            margin-bottom: 8px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Privacy Policy</h1>
        <p class="last-updated">Last updated: ${new Date().toLocaleDateString()}</p>
        
        <h2>Information We Collect</h2>
        <p>This Tarot Reader API is designed with privacy in mind. We do not collect, store, or transmit any personal information. All tarot readings are generated locally in your browser using mathematical algorithms based on seeds.</p>
        
        <h2>Data Usage</h2>
        <p>No personal data is collected or stored. The application uses:</p>
        <ul>
            <li>Random seeds for generating tarot spreads</li>
            <li>Local browser storage for temporary functionality</li>
            <li>No cookies or tracking mechanisms</li>
            <li>No user accounts or registration required</li>
        </ul>
        
        <h2>Third-Party Services</h2>
        <p>This application does not integrate with third-party analytics, advertising, or tracking services. We use Vercel for hosting, which may collect standard web server logs for operational purposes.</p>
        
        <h2>Data Security</h2>
        <p>Since no personal data is collected or transmitted, there are no data security concerns related to personal information. All tarot readings are generated client-side using mathematical algorithms.</p>
        
        <h2>Cookies</h2>
        <p>This application does not use cookies for tracking or storing personal information.</p>
        
        <h2>Changes to This Policy</h2>
        <p>We may update this privacy policy from time to time. Any changes will be reflected on this page with an updated "Last updated" date.</p>
        
        <h2>Contact Information</h2>
        <p>If you have questions about this privacy policy, please contact us through our GitHub repository.</p>
        
        <a href="/" class="back-link">← Back to Tarot Reader</a>
    </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(privacyHtml);
}
