const Product = require('../models/Product');
const Category = require('../models/Category');

exports.getSitemap = async (req, res) => {
  try {
    const baseUrl = process.env.CLIENT_URL || 'https://shrimaruti.com';
    const products = await Product.find().select('slug updatedAt');
    const categories = await Category.find().select('slug updatedAt');

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static pages
    const staticPages = ['', '/products', '/corporate-gifting', '/gift-cards', '/blogs', '/careers', '/about-us'];
    staticPages.forEach(page => {
      xml += `  <url>\n    <loc>${baseUrl}${page}</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });

    // Categories
    categories.forEach(cat => {
      xml += `  <url>\n    <loc>${baseUrl}/products?category=${cat.slug}</loc>\n    <lastmod>${cat.updatedAt.toISOString()}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    });

    // Products
    products.forEach(prod => {
      xml += `  <url>\n    <loc>${baseUrl}/product/${prod.slug}</loc>\n    <lastmod>${prod.updatedAt.toISOString()}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
    });

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    res.status(500).send('Error generating sitemap');
  }
};

exports.getRobotsTxt = (req, res) => {
  const baseUrl = process.env.CLIENT_URL || 'https://shrimaruti.com';
  const robots = `User-agent: *\nAllow: /\nDisallow: /admin*\nDisallow: /checkout*\n\nSitemap: ${baseUrl}/sitemap.xml\n`;
  res.header('Content-Type', 'text/plain');
  res.send(robots);
};
