# 🚀 Deploy to Vercel - Step by Step

## Method 1: GitHub + Vercel (Recommended)

### 1. Push to GitHub
```bash
git add .
git commit -m "Node.js API ready for Vercel"
git push origin main
```

### 2. Deploy on Vercel
1. Go to **[vercel.com](https://vercel.com)**
2. Click **"New Project"**
3. **Import** your GitHub repo
4. **Project settings:**
   - Framework Preset: **Other**
   - Root Directory: **/** (default)
   - Build Command: **Leave empty**
   - Output Directory: **Leave empty**
5. Click **"Deploy"**

### 3. Done! 
Your API will be live at: `https://your-project-name.vercel.app`

---

## Method 2: Vercel CLI

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy
```bash
# From project root
cd TarrotReaderAPI
vercel

# Follow prompts:
# - Set up project? Yes
# - Link to existing project? No  
# - Project name: tarot-reader-api (or whatever)
# - Directory: ./ (default)
```

### 4. Production deploy
```bash
vercel --prod
```

---

## 🧪 Test Your Deployment

Once deployed, test these endpoints:

```bash
# Replace YOUR_DOMAIN with your actual Vercel URL
export API_URL="https://your-project.vercel.app"

# Test create spread
curl $API_URL/api/create-spread

# Test read cards (use seed from above response)
curl "$API_URL/api/spread/SEED_HERE?choose=0,1,2"

# Test download
curl "$API_URL/api/spread/SEED_HERE?choose=0,1,2&download=true"
```

---

## 🔗 Your Live API Endpoints

After deployment, your API will have:

- **Landing page:** `https://your-project.vercel.app/`
- **Create spread:** `https://your-project.vercel.app/api/create-spread`
- **Read spread:** `https://your-project.vercel.app/api/spread/{seed}?choose=0,1,2`
- **API docs:** `https://your-project.vercel.app/api/index`

## 🎯 Pro Tips

1. **Custom domain:** Add your domain in Vercel dashboard → Project → Settings → Domains
2. **Environment variables:** Not needed for this API (it's stateless)
3. **Monitoring:** Check Vercel dashboard for function logs and performance
4. **Edge caching:** Spreads are deterministic, so they cache well
5. **CORS:** Already configured to work from any domain

**Your Tarot API is now live and ready to serve cards! 🔮**
