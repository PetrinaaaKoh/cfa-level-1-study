# Deployment Guide - CFA Level I Study Materials

## Quick Start

The application is ready to deploy! Follow these steps to make it accessible via a shareable link.

## Option 1: GitHub Pages (Recommended)

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `cfa-level-1-study`
3. Keep it **Public** (or Private if you prefer)
4. **Do NOT** initialize with README (we already have one)
5. Click "Create repository"

### Step 2: Push Code to GitHub

Open PowerShell/Command Prompt in the `cfa-study-materials` folder and run:

```bash
# Add your GitHub repository as remote
git remote add origin https://github.com/PetrinaaaKoh/cfa-level-1-study.git

# Push to GitHub
git push -u origin master
```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (top right)
3. Click **Pages** (left sidebar)
4. Under "Source", select:
   - Branch: **main** (or **master**)
   - Folder: **/ (root)**
5. Click **Save**

### Step 4: Access Your Site

After 1-2 minutes, your site will be live at:
```
https://PetrinaaaKoh.github.io/cfa-level-1-study/
```

You can now share this link with anyone!

## Option 2: Netlify (Alternative)

### Step 1: Sign Up
1. Go to https://www.netlify.com/
2. Sign up with GitHub

### Step 2: Deploy
1. Click "Add new site" → "Deploy manually"
2. Drag and drop the entire `cfa-study-materials` folder
3. Wait for deployment (30 seconds)
4. Your site will be live at: `https://random-name.netlify.app`

### Step 3: Customize Domain (Optional)
- Go to Site Settings → Domain Management
- Add custom domain or change Netlify subdomain

## Option 3: Vercel

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Deploy
```bash
cd cfa-study-materials
vercel --prod
```

### Step 3: Follow Prompts
- Login to Vercel
- Confirm deployment settings
- Get your live URL

## Testing Locally

Before deploying, you can test locally:

### Using Python (Recommended)
```bash
cd cfa-study-materials
python -m http.server 8000
```
Then open: http://localhost:8000

### Using Node.js
```bash
cd cfa-study-materials
npx serve
```

### Using Visual Studio Code
1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

## Features Included

✅ **10 CFA Level I Topics:**
- Ethical and Professional Standards (21 questions)
- Quantitative Methods (20 questions)
- Economics (7 questions)
- Financial Statement Analysis (4 questions)
- Corporate Finance (5 questions)
- Equity Investments (6 questions)
- Fixed Income (5 questions)
- Derivatives (5 questions)
- Alternative Investments (5 questions)
- Portfolio Management (6 questions)

✅ **Total: 84 Practice Questions** with detailed explanations

✅ **Features:**
- Dynamic content loading (no page refresh)
- Progress tracking (saved in browser)
- Search functionality
- Mobile-responsive design
- Formula reference cards
- Quiz mode with scoring
- Works offline after first load

## Sharing the Link

Once deployed, simply share the URL:
- Email to colleagues
- Post in study groups
- Add to learning management systems
- Share on social media

No login required - anyone with the link can access!

## Updating Content

To add more questions or update content:

1. Edit the JSON files in the `data/` folder
2. Commit changes:
   ```bash
   git add .
   git commit -m "Add more practice questions"
   git push
   ```
3. GitHub Pages auto-updates in 1-2 minutes

## Troubleshooting

### Site Not Loading
- Wait 2-3 minutes after pushing
- Check GitHub Pages is enabled in Settings
- Verify files are in the repository

### Content Not Showing
- Open browser console (F12)
- Check for errors
- Ensure JSON files are valid

### Mobile Issues
- Test on different devices
- Browser cache may need clearing
- Use responsive design mode in browser dev tools

## Support

For issues or questions about the content, please contact the repository owner.

---

**Note:** This study material is for educational purposes. CFA Institute curriculum is copyrighted by CFA Institute.
