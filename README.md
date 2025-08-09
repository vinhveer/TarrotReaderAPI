# Tarot Reader API

A lightweight JavaScript tarot card reading API with JWT-based spread management, seed-optimized tokens, and cryptographic security. Fully client-side and deployable on GitHub Pages.

## Features

* **Compact Tokens** – \~80% smaller via seed-based generation.
* **Secure** – HMAC-SHA256 signatures, high-entropy seeds.
* **Deterministic Shuffling** – Identical spreads regenerated from the same seed.
* **Pure JavaScript** – No dependencies, runs in any modern browser.
* **Full Deck** – 78 tarot cards with images and meanings.

## Live Demo

[https://vinhveer.github.io/TarrotReaderAPI/](https://vinhveer.github.io/TarrotReaderAPI/)

## Quick Start

1. **Create a Spread**

   ```
   #create-spread
   ```

   Returns a JWT token with an embedded seed.

2. **Draw Cards**

   ```
   #spread/<TOKEN>?choose=0,1,2
   ```

   Returns details for the selected cards.

## API Reference

**Create Spread**

* Endpoint: `#create-spread`
* Method: GET
* Returns: JWT with cryptographic seed

**Read Cards**

* Endpoint: `#spread/<token>?choose=...`
* Method: GET
* Params:

  * `token` – from create-spread
  * `choose` – comma-separated card indices (0–71)

## Examples

* **Single card**: `#spread/TOKEN?choose=0`
* **Three cards**: `#spread/TOKEN?choose=0,1,2`
* **Celtic Cross**: `#spread/TOKEN?choose=0,1,2,3,4,5,6,7,8,9`

## Technical Overview

* **Seed-Based Design** – Stores only a cryptographic seed; spreads are regenerated deterministically.
* **Security** – HS256 JWT, tamper detection, algorithm safety, timing-attack resistance.
* **Performance** – On-demand deck generation, optimized Fisher–Yates shuffle, minimal memory usage.

## Browser Requirements

* Chrome 60+, Firefox 55+, Safari 11+, Edge 79+
* Requires Web Crypto API, ES6, TextEncoder/TextDecoder

## Local Development

```bash
git clone https://github.com/vinhveer/TarrotReaderAPI.git
cd TarrotReaderAPI
python -m http.server 8000  # or npx serve .
```

Visit `http://localhost:8000`

## Deployment

* **GitHub Pages** – Static hosting from your repo.
* Works on Netlify, Vercel, Surge.sh, Firebase, AWS S3.

## License

MIT License. Images and meanings for educational/entertainment purposes only.

---

Nếu bạn muốn, tôi có thể viết lại README này **ngắn hơn nữa** chỉ gói gọn trong 1 trang A4 mà vẫn giữ đủ thông tin kỹ thuật. Bạn có muốn tôi làm không?
