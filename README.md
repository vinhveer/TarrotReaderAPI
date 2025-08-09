# Tarot Reader API

## Features

* **Deterministic Shuffling** – Same seed = same spread every time
* **Pure JavaScript** – No dependencies, runs anywhere
* **Full Deck** – 78 tarot cards with images and meanings
* **Super Short URLs** – `#spread/abc123?choose=0,1,2`

## Live Demo

[https://vinhveer.github.io/TarrotReaderAPI/](https://vinhveer.github.io/TarrotReaderAPI/)

## Quick Start

1. **Create a Spread**

   ```
   #create-spread
   ```

   Returns a simple seed and ready-to-use URL.

2. **Draw Cards**

   ```
   #spread/<SEED>?choose=0,1,2
   ```

   Example: `#spread/abc123def?choose=0,1,2`

   Returns details for the selected cards.

## API Reference

**Create Spread**

* Endpoint: `#create-spread`
* Method: GET
* Returns: Simple seed + ready URL

**Read Cards**

* Endpoint: `#spread/<seed>?choose=...`
* Method: GET
* Params:

  * `seed` – from create-spread (e.g. `abc123def`)
  * `choose` – comma-separated card indices (0–71)

## Examples

* **Single card**: `#spread/abc123?choose=0`
* **Three cards**: `#spread/abc123?choose=0,1,2`
* **Celtic Cross**: `#spread/abc123?choose=0,1,2,3,4,5,6,7,8,9`

## Technical Overview

* **Ultra Simple** – No JWT, no encryption, just seed strings
* **Deterministic** – Same seed always generates identical spread
* **Compact URLs** – Seeds are ~15 chars vs ~200+ char JWT tokens  
* **Fast** – On-demand deck generation, optimized Fisher–Yates shuffle

## Browser Requirements

* Chrome 60+, Firefox 55+, Safari 11+, Edge 79+
* Requires ES6 (async/await, arrow functions)

## Local Development

```bash
git clone https://github.com/vinhveer/TarrotReaderAPI.git
cd TarrotReaderAPI
python -m http.server 8000  # or npx serve .
```

Visit `http://localhost:8000`

## License

MIT License. Images and meanings for educational/entertainment purposes only.

---

Nếu bạn muốn, tôi có thể viết lại README này **ngắn hơn nữa** chỉ gói gọn trong 1 trang A4 mà vẫn giữ đủ thông tin kỹ thuật. Bạn có muốn tôi làm không?
