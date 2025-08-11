/**
 * Main application logic
 * Handles routing and tarot card operations
 */

// No JWT needed - using seeds directly for ultra-compact URLs

// Global variable to store tarot data
let tarotData = null;

/**
 * Download JSON data as file
 * @param {string} jsonString - JSON string to download
 * @param {string} filename - filename for download
 */
function downloadJSON(jsonString, filename) {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Load tarot.json data
 * @returns {Promise<Object>} tarot data
 */
async function loadTarotData() {
    if (tarotData) {
        return tarotData;
    }
    
    try {
        const response = await fetch('./tarot.json');
        if (!response.ok) {
            throw new Error(`Failed to load tarot.json: ${response.status}`);
        }
        tarotData = await response.json();
        return tarotData;
    } catch (error) {
        throw new Error(`Error loading tarot data: ${error.message}`);
    }
}

/**
 * Normalize card data to standard format
 * @param {Object} card - raw card data
 * @returns {Object} normalized card data
 */
function normalizeCard(card) {
    let meaningUpright, meaningReversed;
    
    // Handle different tarot.json formats
    if (card.meaning_upright && card.meaning_reversed) {
        // Direct format
        meaningUpright = card.meaning_upright;
        meaningReversed = card.meaning_reversed;
    } else if (card.meanings && card.meanings.light && card.meanings.shadow) {
        // Complex format - join arrays into strings
        meaningUpright = Array.isArray(card.meanings.light) 
            ? card.meanings.light.join('. ') 
            : card.meanings.light;
        meaningReversed = Array.isArray(card.meanings.shadow) 
            ? card.meanings.shadow.join('. ') 
            : card.meanings.shadow;
    } else {
        // Fallback
        meaningUpright = "Positive energy and forward movement";
        meaningReversed = "Blocked energy or reversed meaning";
    }
    
    return {
        name: card.name,
        meaning_upright: meaningUpright,
        meaning_reversed: meaningReversed
    };
}

/**
 * Handle create-spread route
 * @returns {Promise<string>} JSON response
 */
async function handleCreateSpread() {
    try {
        // Generate random spread
        const spreadResult = createSpread();
        
        // Return response with seed directly (no JWT)
        const baseUrl = `${window.location.origin}${window.location.pathname}`;
        const response = {
            seed: spreadResult.seed,
            deck_size: spreadResult.totalCards,
            url: `${baseUrl}#spread/${spreadResult.seed}?choose=0,1,2`,
            download_url: `${baseUrl}#spread/${spreadResult.seed}?choose=0,1,2&download=true`,
            raw_url: `${baseUrl}#spread/${spreadResult.seed}?choose=0,1,2&format=raw`
        };
        
        return JSON.stringify(response);
    } catch (error) {
        return JSON.stringify({ error: error.message });
    }
}

/**
 * Handle spread/<seed> route
 * @param {string} seed - seed string from URL
 * @param {string} chooseParam - choose parameter from query string
 * @returns {Promise<string>} JSON response
 */
async function handleSpreadRead(seed, chooseParam) {
    try {
        // Load tarot data
        const tarot = await loadTarotData();
        
        // Use seed directly (no JWT needed)
        if (!seed || typeof seed !== 'string') {
            throw new Error('Invalid or missing seed. Please create a new spread.');
        }
        
        // Clean seed (remove any URL artifacts)
        seed = seed.trim();
        
        // Regenerate deck from seed
        const deck = generateSpreadFromSeed(seed, 72);
        
        // Verify deck generation worked
        if (!deck || deck.length !== 72) {
            throw new Error(`Deck generation failed. Seed: ${seed}, Generated: ${deck ? deck.length : 'null'} cards`);
        }
        
        // Parse choose parameter (comma-separated indices)
        const chosenIndices = chooseParam
            ? chooseParam.split(',').map(i => parseInt(i.trim(), 10))
            : [];
        
        // Validate chosen indices
        const validIndices = chosenIndices.filter(i => 
            !isNaN(i) && i >= 0 && i < deck.length
        );
        
        // Get chosen cards
        const chosen = validIndices.map(deckIndex => {
            const deckCard = deck[deckIndex];
            const cardIndex = deckCard.index;
            const orientation = deckCard.orientation;
            
            // Get card from tarot data
            if (cardIndex < 0 || cardIndex >= tarot.cards.length) {
                throw new Error(`Invalid card index: ${cardIndex}`);
            }
            
            const rawCard = tarot.cards[cardIndex];
            const normalizedCard = normalizeCard(rawCard);
            
            // Apply orientation
            const meaning = orientation === 1 
                ? normalizedCard.meaning_upright 
                : normalizedCard.meaning_reversed;
            
            return {
                name: normalizedCard.name,
                meaning: meaning,
                orientation: orientation === 1 ? 'upright' : 'reversed'
            };
        });
        
        const response = {
            chosen: chosen,
            ...(chosen.length === 0 && {
                info: {
                    total_cards: deck.length,
                    seed_used: seed,
                    choose_param: chooseParam || 'not provided',
                    message: chooseParam ? 'No valid card indices found' : 'Add ?choose=0,1,2 to select cards'
                }
            })
        };
        
        return JSON.stringify(response);
    } catch (error) {
        return JSON.stringify({ error: error.message });
    }
}

/**
 * Handle privacy-policy route
 * @returns {Promise<string>} HTML response
 */
async function handlePrivacyPolicy() {
    const privacyContent = `
        <!doctype html>
        <html lang="vi">
        <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>Chính sách bảo mật — Tarot JSON GPT</title>
        <meta name="description" content="Chính sách bảo mật cho Tarot JSON GPT. Chúng tôi tối thiểu hoá dữ liệu, không gửi thông tin cá nhân sang API Tarot; chỉ truyền seed và chỉ số lá 0-based." />
        <meta name="robots" content="index,follow" />
        <meta property="og:title" content="Chính sách bảo mật — Tarot JSON GPT" />
        <meta property="og:description" content="Chính sách bảo mật cho Tarot JSON GPT. Chúng tôi tối thiểu hoá dữ liệu, không gửi thông tin cá nhân sang API Tarot; chỉ truyền seed và chỉ số lá 0-based." />
        <meta property="og:type" content="website" />
        <style>
            :root {
            --bg: #ffffff; --fg: #111827; --muted:#6b7280; --card:#f9fafb; --accent:#111827;
            --link:#1f2937; --border:#e5e7eb;
            }
            @media (prefers-color-scheme: dark) {
            :root {
                --bg:#0b0f1a; --fg:#e5e7eb; --muted:#9ca3af; --card:#0f1524; --accent:#93c5fd;
                --link:#93c5fd; --border:#1f2937;
            }
            }
            html,body{margin:0;padding:0;background:var(--bg);color:var(--fg);font-family:system-ui,-apple-system,Segoe UI,Roboto,Inter,Arial,sans-serif;line-height:1.6}
            .container{max-width:900px;margin:0 auto;padding:32px 20px}
            header{margin-bottom:24px}
            h1{font-size: clamp(28px, 4vw, 40px);line-height:1.2;margin:0 0 12px 0}
            .sub{color:var(--muted);font-size:14px}
            nav{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:12px 16px;margin:24px 0}
            nav a{color:var(--link);text-decoration:none;margin-right:16px;font-size:14px}
            section{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:20px;margin:16px 0}
            h2{margin:0 0 8px 0;font-size:20px}
            ul{padding-left:20px;margin:8px 0}
            code{background:rgba(125,125,125,.12);padding:.15em .35em;border-radius:6px}
            footer{margin-top:24px;color:var(--muted);font-size:14px}
            .tag{display:inline-block;background:rgba(125,125,125,.12);border:1px solid var(--border);border-radius:999px;padding:4px 10px;font-size:12px;margin-right:8px}
            .note{font-size:14px;color:var(--muted)}
        </style>
        </head>
        <body>
        <div class="container">
            <header>
            <h1>Chính sách bảo mật — Tarot JSON GPT</h1>
            <div class="sub">
                Nhà phát hành: <strong>Nguyễn Quang Vinh</strong> ·
                Email hỗ trợ: <a href="mailto:contact.nguyenquangvinh@gmail.com">contact.nguyenquangvinh@gmail.com</a> ·
                Cập nhật lần cuối: <time datetime="2025-08-11">11/08/2025</time>
            </div>
            <div style="margin-top:10px">
                <span class="tag">Tối thiểu dữ liệu</span>
                <span class="tag">HTTPS</span>
                <span class="tag">Không bịa</span>
            </div>
            </header>

            <nav aria-label="Mục lục">
            <a href="#mo-ta">Mô tả</a>
            <a href="#du-lieu-xu-ly">Dữ liệu xử lý</a>
            <a href="#muc-dich">Mục đích</a>
            <a href="#luu-tru">Lưu trữ</a>
            <a href="#chia-se">Chia sẻ</a>
            <a href="#quyen">Quyền của bạn</a>
            <a href="#bao-mat">Bảo mật</a>
            <a href="#tre-em">Trẻ em</a>
            <a href="#chuyen-quoc-te">Chuyển quốc tế</a>
            <a href="#thay-doi">Thay đổi</a>
            <a href="#lien-he">Liên hệ</a>
            </nav>

            <section id="mo-ta">
            <h2>1) Mô tả sản phẩm</h2>
            <p><strong>Tarot JSON GPT</strong> là GPT chạy trong ChatGPT, dùng <em>Action</em> gọi <code>Tarot JSON API</code> tại
            <code>https://tarrot-reader-api.vercel.app</code> để thực hiện lượt rút bài Tarot. GPT này <strong>chỉ dùng JSON</strong>
            (không dùng HTML/JS của bên ngoài để hiển thị kết quả).</p>
            </section>

            <section id="du-lieu-xu-ly">
            <h2>2) Dữ liệu chúng tôi xử lý</h2>
            <ul>
                <li><strong>Dữ liệu trong hội thoại ChatGPT</strong>: nội dung bạn nhập (ví dụ câu hỏi, bối cảnh, thông tin tuỳ chọn như ngày sinh/tên).
                Phần này do <strong>OpenAI</strong> xử lý theo chính sách riêng của họ.</li>
                <li><strong>Dữ liệu gửi tới Tarot JSON API</strong>: chỉ gồm tham số kỹ thuật để rút bài:
                <ul>
                    <li><code>seed</code> (định danh lượt rút);</li>
                    <li><code>choose</code> (danh sách chỉ số lá <em>0-based</em>, ví dụ <code>0,5,10</code>).</li>
                </ul>
                <em>Chúng tôi không gửi tên, ngày sinh, câu hỏi hay thông tin cá nhân của bạn sang API.</em>
                </li>
                <li><strong>Dữ liệu API trả về</strong>: danh sách lá đã rút (tên lá, ý nghĩa RWS ngắn, orientation nếu có).</li>
            </ul>
            <p class="note">Bạn luôn có thể sử dụng GPT mà không cung cấp thông tin cá nhân nhạy cảm.</p>
            </section>

            <section id="muc-dich">
            <h2>3) Mục đích sử dụng dữ liệu</h2>
            <p>Chỉ để thực hiện lượt rút Tarot, hiển thị kết quả (tên lá, nghĩa RWS, orientation nếu có) ngay trong ChatGPT và hỗ trợ bạn
            tóm tắt/gợi ý hành động dựa trên nghĩa RWS.</p>
            </section>

            <section id="luu-tru">
            <h2>4) Lưu trữ & thời gian lưu</h2>
            <ul>
                <li><strong>Nguyen Quang Vinh</strong> (nhà phát hành GPT): không lưu bản sao dữ liệu người dùng bên ngoài ChatGPT.</li>
                <li><strong>OpenAI</strong>: có thể xử lý/lưu trữ dữ liệu hội thoại theo chính sách của họ.</li>
                <li><strong>Tarot JSON API</strong>: dịch vụ không yêu cầu thông tin cá nhân; có thể phát sinh log kỹ thuật ở hạ tầng hosting.</li>
            </ul>
            </section>

            <section id="chia-se">
            <h2>5) Chia sẻ dữ liệu</h2>
            <ul>
                <li><strong>OpenAI</strong> – để vận hành ChatGPT/GPTs.</li>
                <li><strong>Tarot JSON API</strong> (<code>tarrot-reader-api.vercel.app</code>) – chỉ nhận <code>seed</code> và chỉ số lá 0-based.</li>
            </ul>
            </section>

            <section id="quyen">
            <h2>6) Quyền của bạn</h2>
            <ul>
                <li>Không bắt buộc cung cấp thông tin cá nhân; có thể dùng câu hỏi ẩn danh.</li>
                <li>Không nhập dữ liệu nhạy cảm (sức khoẻ, tài chính, định danh cá nhân…)</li>
                <li>Đối với dữ liệu nằm trong ChatGPT, hãy xem hướng dẫn/quyền riêng tư của OpenAI.</li>
                <li>Liên hệ chúng tôi để hỏi đáp về chính sách này qua <a href="mailto:contact.nguyenquangvinh@gmail.com">contact.nguyenquangvinh@gmail.com</a>.</li>
            </ul>
            </section>

            <section id="bao-mat">
            <h2>7) Bảo mật</h2>
            <p>Kết nối tới API được mã hoá bằng HTTPS. Dù vậy, không hệ thống nào an toàn tuyệt đối; vui lòng hạn chế nhập thông tin nhạy cảm.</p>
            </section>

            <section id="tre-em">
            <h2>8) Trẻ em</h2>
            <p>Sản phẩm không hướng tới người dưới 13 tuổi.</p>
            </section>

            <section id="chuyen-quoc-te">
            <h2>9) Chuyển dữ liệu quốc tế</h2>
            <p>Do GPT chạy trên nền tảng ChatGPT, dữ liệu có thể được xử lý trên hạ tầng toàn cầu của OpenAI.</p>
            </section>

            <section id="thay-doi">
            <h2>10) Thay đổi chính sách</h2>
            <p>Chúng tôi có thể cập nhật tài liệu này. Bản cập nhật mới nhất sẽ được công bố tại URL của trang này.</p>
            </section>

            <section id="lien-he">
            <h2>11) Liên hệ</h2>
            <p>Mọi thắc mắc xin gửi tới: <a href="mailto:contact.nguyenquangvinh@gmail.com">contact.nguyenquangvinh@gmail.com</a>.</p>
            </section>

            <footer>
            © <span id="y"></span> Nguyen Quang Vinh · Tarot JSON GPT · Chính sách bảo mật
            <script>document.getElementById('y').textContent = new Date().getFullYear();</script>
            </footer>
        </div>
        </body>
        </html>
    `;
    
    return privacyContent;
}

/**
 * Parse URL and route to appropriate handler
 */
async function handleRouting() {
    const hash = window.location.hash.slice(1); // Remove # character
    const search = window.location.search;
    
    try {
        let result;
        
        if (hash === 'create-spread') {
            // Create new spread
            result = await handleCreateSpread();
        } else if (hash === 'privacy-policy') {
            // Privacy policy page
            result = await handlePrivacyPolicy();
        } else if (hash.startsWith('spread/')) {
            // Read existing spread
            let seedPart = hash.substring('spread/'.length);
            if (!seedPart) {
                throw new Error('Missing seed in URL');
            }
            
            // Split seed from any query parameters that might be in the hash
            const queryIndex = seedPart.indexOf('?');
            let seed, hashQuery = '';
            if (queryIndex !== -1) {
                seed = seedPart.substring(0, queryIndex);
                hashQuery = seedPart.substring(queryIndex + 1);
            } else {
                seed = seedPart;
            }
            
            // Parse query parameters from both URL search and hash
            const urlParams = new URLSearchParams(search);
            const hashParams = new URLSearchParams(hashQuery);
            
            // Priority: hash params > URL params
            const chooseParam = hashParams.get('choose') || urlParams.get('choose');
            
            result = await handleSpreadRead(seed, chooseParam);
        } else {
            // Default route or invalid route
            const currentUrl = window.location.href;
            const isSpreadUrl = hash.startsWith('spread/');
            
            result = JSON.stringify({
                message: 'Tarot Reader API - Ultra Compact Edition',
                ...(isSpreadUrl && {
                    error: 'Invalid spread URL. Please check your seed or create a new spread.',
                    troubleshooting: [
                        'Seed may be corrupted or incomplete',
                        'URL may have been modified',
                        'Create a new spread to get a fresh seed'
                    ]
                }),
                routes: [
                    '#create-spread - Create new tarot spread',
                    '#spread/<seed>?choose=0,1,2 - Read cards from spread (HTML)',
                    '#spread/<seed>?choose=0,1,2&format=raw - Pure JSON response',
                    '#spread/<seed>?choose=0,1,2&download=true - Download JSON file',
                    '#privacy-policy - Privacy policy page'
                ],
                examples: [
                    'Try: ' + window.location.origin + window.location.pathname + '#create-spread',
                    'HTML: ' + window.location.origin + window.location.pathname + '#spread/YOUR_SEED?choose=0,1,2',
                    'JSON: ' + window.location.origin + window.location.pathname + '#spread/YOUR_SEED?choose=0,1,2&format=raw',
                    'Download: ' + window.location.origin + window.location.pathname + '#spread/YOUR_SEED?choose=0,1,2&download=true'
                ]
            });
        }
        
        // Check if user wants to download JSON file
        const urlParams = new URLSearchParams(search);
        const download = urlParams.get('download');
        const format = urlParams.get('format');
        
        if (hash === 'privacy-policy') {
            // Privacy policy returns complete HTML, replace entire document
            document.open();
            document.write(result);
            document.close();
        } else if (download === 'true') {
            // Create and download JSON file
            downloadJSON(result, `tarot-${Date.now()}.json`);
            document.body.innerHTML = `<pre>JSON file downloaded!</pre>`;
        } else if (format === 'raw') {
            // Pure JSON response (no HTML wrapper)
            document.body.textContent = result;
            document.body.style.fontFamily = 'monospace';
            document.body.style.whiteSpace = 'pre';
        } else {
            // Default: formatted JSON in HTML
            document.body.innerHTML = `<pre>${result}</pre>`;
        }
        
    } catch (error) {
        const errorResult = JSON.stringify({ error: error.message });
        
        const urlParams = new URLSearchParams(search);
        const download = urlParams.get('download');
        const format = urlParams.get('format');
        
        if (download === 'true') {
            downloadJSON(errorResult, `tarot-error-${Date.now()}.json`);
            document.body.innerHTML = `<pre>Error JSON file downloaded!</pre>`;
        } else if (format === 'raw') {
            document.body.textContent = errorResult;
            document.body.style.fontFamily = 'monospace';
            document.body.style.whiteSpace = 'pre';
        } else {
            document.body.innerHTML = `<pre>${errorResult}</pre>`;
        }
    }
}

/**
 * Initialize application when DOM is loaded
 */
if (!window.IS_TEST) {
    document.addEventListener('DOMContentLoaded', handleRouting);
    window.addEventListener('hashchange', handleRouting);
}
