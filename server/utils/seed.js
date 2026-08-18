require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Banner = require('../models/Banner');
const Coupon = require('../models/Coupon');
const Blog = require('../models/Blog');
const Job = require('../models/Job');

const seedData = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ganeshgifting';
    console.log(`[Seed] Connecting to MongoDB: ${connStr}`);
    await mongoose.connect(connStr);

    console.log('[Seed] Clearing existing collections...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Banner.deleteMany({});
    await Coupon.deleteMany({});
    await Blog.deleteMany({});
    await Job.deleteMany({});

    // 1. Seed Admin & Support Users
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@shrimaruti.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

    await User.create({
      name: 'Anuj Singh Admin',
      email: adminEmail.toLowerCase(),
      phone: '9876543210',
      password: adminPassword,
      role: 'admin',
      referralCode: 'ADMINREF100',
      loyaltyPoints: 1000,
      isEmailVerified: true
    });

    await User.create({
      name: 'Support Team',
      email: 'support@shrimaruti.com',
      phone: '9876543211',
      password: 'Support@123456',
      role: 'support',
      referralCode: 'SUPPREF100',
      loyaltyPoints: 200,
      isEmailVerified: true
    });

    console.log(`[Seed] Admin User Created: ${adminEmail} | Password: ${adminPassword}`);
    console.log(`[Seed] Support User Created: support@shrimaruti.com`);

    // 2. Seed 15 Exact Categories
    const categoriesData = [
      { name: 'Home Decor', slug: 'home-decor', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop', description: 'Stylish lamps, planters, wall accents & artistic decor.' },
      { name: 'Wooden Earrings', slug: 'wooden-earrings', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop', description: 'Eco-friendly handcrafted wooden jewellery & earrings.' },
      { name: 'Photo Frame', slug: 'photo-frame', image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&auto=format&fit=crop', description: 'Elegant photo frames & memory displays.' },
      { name: 'Home Living Gifts', slug: 'home-living-gifts', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format&fit=crop', description: 'Cozy living room essentials & luxury aesthetics.' },
      { name: 'Home Essentials Gifts', slug: 'home-essentials-gifts', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop', description: 'Useful household gifts, coasters, and kitchenware.' },
      { name: 'Toy & Puzzle', slug: 'toy-and-puzzle', image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&auto=format&fit=crop', description: 'Fun 3D wooden puzzles, brain teasers & kids toys.' },
      { name: 'Birthday', slug: 'birthday', image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop', description: 'Surprise birthday gifts, hampers & customized items.' },
      { name: 'Anniversary', slug: 'anniversary', image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&auto=format&fit=crop', description: 'Romantic gifts, couples keepsakes & golden memories.' },
      { name: 'Personalised', slug: 'personalised', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop', description: 'Custom engraved wooden plaques, mugs & gifts.' },
      { name: 'Occasions', slug: 'occasions', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format&fit=crop', description: 'Festive gifts for Diwali, Rakhi, Holi & special days.' },
      { name: '3D Designs', slug: '3d-designs', image: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=600&auto=format&fit=crop', description: 'Precision 3D printed artistic structures & decor.' },
      { name: '3D Mandir', slug: '3d-mandir', image: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=600&auto=format&fit=crop', description: 'Intricate 3D wooden mandir & divine temple models.' },
      { name: 'Personalised Photos', slug: 'personalised-photos', image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&auto=format&fit=crop', description: 'Acrylic & wood printed custom photo keepsakes.' },
      { name: '3D Cars', slug: '3d-cars', image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&auto=format&fit=crop', description: 'Detailed 3D printed miniature car models & desk showpieces.' },
      { name: '3D Cartoon', slug: '3d-cartoon', image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop', description: 'Cute 3D printed anime & cartoon character figurines.' }
    ];

    const createdCategories = await Category.insertMany(categoriesData);
    console.log(`[Seed] Created ${createdCategories.length} Categories.`);

    const catMap = {};
    createdCategories.forEach(c => catMap[c.slug] = c._id);

    // 3. Seed Sample Products across categories
    const productsData = [
      {
        name: 'Divine 3D Carved Wooden Mandir with LED Light',
        slug: 'divine-3d-carved-wooden-mandir',
        category: catMap['3d-mandir'],
        categoryName: '3D Mandir',
        price: 2499,
        originalPrice: 3499,
        stock: 12,
        images: ['https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=800&auto=format&fit=crop'],
        description: 'Exquisite 3D laser-cut wooden temple for home & office pooja space.',
        whyBuy: ['Crafted from premium teakwood finish MDF', 'Inbuilt warm LED backdrop light', 'Compact desk & wall mountable'],
        isBestseller: true,
        isTrending: true,
        rating: 4.9,
        numReviews: 42
      },
      {
        name: 'Custom Engraved Wooden Photo Frame',
        slug: 'custom-engraved-wooden-photo-frame',
        category: catMap['photo-frame'],
        categoryName: 'Photo Frame',
        price: 799,
        originalPrice: 1199,
        stock: 30,
        images: ['https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&auto=format&fit=crop'],
        description: 'High definition laser engraved photo on natural pine wood.',
        whyBuy: ['Lifetime wood print durability', 'Add custom message & date', 'Includes wooden stand'],
        isBestseller: true,
        isTrending: true,
        rating: 4.8,
        numReviews: 55
      },
      {
        name: 'Handcrafted Minimalist Wooden Drop Earrings',
        slug: 'handcrafted-minimalist-wooden-drop-earrings',
        category: catMap['wooden-earrings'],
        categoryName: 'Wooden Earrings',
        price: 349,
        originalPrice: 599,
        stock: 50,
        images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop'],
        description: 'Featherlight eco-friendly rosewood earrings with anti-allergic sterling hooks.',
        whyBuy: ['100% natural wood finish', 'Super lightweight & comfortable', 'Ideal for daily wear & gifting'],
        isBestseller: true,
        isTrending: false,
        rating: 4.7,
        numReviews: 19
      },
      {
        name: '3D Vintage Sports Car Miniature Model',
        slug: '3d-vintage-sports-car-miniature-model',
        category: catMap['3d-cars'],
        categoryName: '3D Cars',
        price: 1299,
        originalPrice: 1899,
        stock: 15,
        images: ['https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&auto=format&fit=crop'],
        description: 'Precision 3D printed classic convertible sports car desk collectible.',
        whyBuy: ['Intricate wheel & steering detail', 'Perfect desk showpiece for car lovers', 'Collector edition packaging'],
        isBestseller: false,
        isTrending: true,
        rating: 4.9,
        numReviews: 24
      },
      {
        name: 'Custom 3D Cute Anime Character Bobblehead',
        slug: 'custom-3d-cute-anime-character-bobblehead',
        category: catMap['3d-cartoon'],
        categoryName: '3D Cartoon',
        price: 999,
        originalPrice: 1499,
        stock: 20,
        images: ['https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop'],
        description: 'Vibrant 3D printed cartoon collectible figure with custom name base.',
        whyBuy: ['Non-toxic high durability resin', 'Bright fade-proof colors', 'Fun dashboard or desk accessory'],
        isBestseller: true,
        isTrending: true,
        rating: 4.8,
        numReviews: 31
      },
      {
        name: 'Personalised Acrylic LED Night Lamp',
        slug: 'personalised-acrylic-led-night-lamp',
        category: catMap['home-decor'],
        categoryName: 'Home Decor',
        price: 899,
        originalPrice: 1399,
        stock: 25,
        images: ['https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop'],
        description: '3D optical illusion warm LED lamp customized with your name & couple photo.',
        whyBuy: ['Energy efficient warm glow', 'Solid beechwood base', 'Perfect anniversary & birthday gift'],
        isBestseller: true,
        isTrending: true,
        rating: 4.9,
        numReviews: 68
      },
      {
        name: '3D Mechanical Wooden Locomotive Puzzle Toy',
        slug: '3d-mechanical-wooden-locomotive-puzzle-toy',
        category: catMap['toy-and-puzzle'],
        categoryName: 'Toy & Puzzle',
        price: 1599,
        originalPrice: 2299,
        stock: 18,
        images: ['https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&auto=format&fit=crop'],
        description: 'Self-assembly 3D wooden train model puzzle with working gears & spring motor.',
        whyBuy: ['No glue needed - snap fit assembly', 'Enhances spatial reasoning & focus', 'Fun project for kids & adults'],
        isBestseller: false,
        isTrending: true,
        rating: 4.8,
        numReviews: 15
      }
    ];

    await Product.insertMany(productsData);
    console.log(`[Seed] Created ${productsData.length} Products.`);

    // 4. Seed Hero Banners
    const bannersData = [
      {
        title: '3D Mandir & Sacred Artistry',
        subtitle: 'Bring divine energy into your home with precision 3D carved wooden mandirs',
        ctaText: 'Explore 3D Mandirs',
        link: '/products?category=3d-mandir',
        image: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=1600&auto=format&fit=crop',
        type: 'hero',
        order: 1
      },
      {
        title: 'Custom Photo Frames & Engravings',
        subtitle: 'Turn your cherished memories into lifetime wooden keepsakes',
        ctaText: 'Personalise Now',
        link: '/products?category=photo-frame',
        image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=1600&auto=format&fit=crop',
        type: 'hero',
        order: 2
      },
      {
        title: 'Handcrafted Wooden Jewellery',
        subtitle: 'Eco-friendly lightweight wooden earrings for every style',
        ctaText: 'Shop Earrings',
        link: '/products?category=wooden-earrings',
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1600&auto=format&fit=crop',
        type: 'hero',
        order: 3
      }
    ];

    await Banner.insertMany(bannersData);
    console.log('[Seed] Created Hero Banners.');

    // 5. Seed Discount Coupons
    const couponsData = [
      { code: 'GANESH10', discountType: 'percentage', discountValue: 10, minOrderValue: 499, expiryDate: new Date('2026-12-31') },
      { code: 'FIRSTGIFT', discountType: 'flat', discountValue: 100, minOrderValue: 799, expiryDate: new Date('2026-12-31') },
      { code: 'FESTIVE20', discountType: 'percentage', discountValue: 20, minOrderValue: 1499, expiryDate: new Date('2026-12-31') }
    ];

    await Coupon.insertMany(couponsData);
    console.log('[Seed] Created Discount Coupons.');

    console.log('[Seed] Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
};

seedData();
