# Trend Wear BD — Premium Editable Landing Page

## Run
1. Install Node.js 18+.
2. `npm install`
3. Copy `.env.example` to `.env` and set a strong `ADMIN_PASSWORD`.
4. `npm start`
5. Public site: `http://localhost:3000/`
6. Editor: `http://localhost:3000/admin`

## Editable
- Brand/SEO/WhatsApp
- Hero headline, subtitle, CTA and image
- Categories
- Featured products, price, old price, badge and image path
- Promo banner
- About
- Benefits
- Testimonials
- FAQ
- CTA
- Footer and social links
- Show/hide sections
- Section reorder
- Save & Publish
- Responsive mobile/tablet/desktop design

## Image uploads
The backend has a secure authenticated `/api/upload` endpoint for JPG/JPEG/PNG/WEBP/GIF/SVG up to 5 MB. The editor currently exposes image-path fields so uploaded paths can be pasted into any section.

For production, use a persistent database and object storage (for example PostgreSQL + S3/R2) rather than local `data.json`/uploads on an ephemeral hosting disk.


### Assets
The included demo uses raster JPG fashion imagery only; there are no SVG product/hero placeholders in `public/assets`.
