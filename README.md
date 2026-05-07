# Kota Tua 3D Viewer

A 3D heritage viewer for Kota Tua built with Next.js, Cesium, and NextUI.

## Tech Stack
- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [NextUI](https://nextui.org/)
- **3D Engine:** [CesiumJS](https://cesium.com/) & [Resium](https://resium.darwineducation.com/)

## Getting Started

### Prerequisites
You need Node.js installed. We use `npm` as the package manager.

### Installation
1. Navigate into the frontend folder:
   ```bash
   cd src/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup your environment variables:
   Copy `.env.example` to `.env` and fill in your keys:
   ```bash
   cp .env.example .env
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment (Railway)
This application is configured to be deployed easily on [Railway](https://railway.app/).

1. Create a new project in Railway and select **Deploy from GitHub repo**.
2. Go to your service **Settings** -> **Build** and set the **Root Directory** to `/src/frontend`.
3. Go to the **Variables** tab and add your keys:
   - `NEXT_PUBLIC_CESIUM_ACCESS_TOKEN`
   - `NEXT_PUBLIC_STADIA_API_KEY`
4. The postinstall script will automatically symlink the Cesium static assets and deploy your application seamlessly.

Result : visit this [Kota Tua 3D Viewer](https://kota-tua.geotwinverse.ai/)