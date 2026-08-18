const fallbackCategories = [
  { _id: 'cat_1', name: 'Home Decor', slug: 'home-decor', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop', description: 'Stylish lamps, planters, wall accents & artistic decor.', displayOrder: 1 },
  { _id: 'cat_2', name: 'Wooden Earrings', slug: 'wooden-earrings', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop', description: 'Eco-friendly handcrafted wooden jewellery & earrings.', displayOrder: 2 },
  { _id: 'cat_3', name: 'Photo Frame', slug: 'photo-frame', image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&auto=format&fit=crop', description: 'Elegant photo frames & memory displays.', displayOrder: 3 },
  { _id: 'cat_4', name: 'Home Living Gifts', slug: 'home-living-gifts', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format&fit=crop', description: 'Cozy living room essentials & luxury aesthetics.', displayOrder: 4 },
  { _id: 'cat_5', name: 'Home Essentials Gifts', slug: 'home-essentials-gifts', image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&auto=format&fit=crop', description: 'Daily luxury home utility items.', displayOrder: 5 },
  { _id: 'cat_6', name: 'Toy & Puzzle', slug: 'toy-and-puzzle', image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&auto=format&fit=crop', description: 'Educational wooden puzzles & toys for kids.', displayOrder: 6 },
  { _id: 'cat_7', name: 'Birthday', slug: 'birthday', image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop', description: 'Special birthday hampers & personalized gifts.', displayOrder: 7 },
  { _id: 'cat_8', name: 'Anniversary', slug: 'anniversary', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop', description: 'Romantic anniversary gift sets.', displayOrder: 8 },
  { _id: 'cat_9', name: 'Personalised', slug: 'personalised', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop', description: 'Custom engraved & printed gifts.', displayOrder: 9 },
  { _id: 'cat_10', name: 'Occasions', slug: 'occasions', image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop', description: 'Festival & celebration gifts.', displayOrder: 10 },
  { _id: 'cat_11', name: '3D Designs', slug: '3d-designs', image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop', description: 'High precision 3D printed art pieces.', displayOrder: 11 },
  { _id: 'cat_12', name: '3D Mandir', slug: '3d-mandir', image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=600&auto=format&fit=crop', description: 'Handcrafted 3D temples & spiritual idols.', displayOrder: 12 },
  { _id: 'cat_13', name: 'Personalised Photos', slug: 'personalised-photos', image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&auto=format&fit=crop', description: 'Custom photo plaques & acrylic block prints.', displayOrder: 13 },
  { _id: 'cat_14', name: '3D Cars', slug: '3d-cars', image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&auto=format&fit=crop', description: '3D printed scale model cars & collectibles.', displayOrder: 14 },
  { _id: 'cat_15', name: '3D Cartoon', slug: '3d-cartoon', image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&auto=format&fit=crop', description: 'Custom 3D anime & cartoon bobbleheads.', displayOrder: 15 }
];

const fallbackProducts = [
  {
    _id: 'prod_1',
    name: '3D Printed Illuminated Ram Mandir Model',
    slug: '3d-printed-illuminated-ram-mandir-model',
    category: 'cat_12',
    categoryName: '3D Mandir',
    price: 1499,
    originalPrice: 2499,
    stock: 45,
    images: ['https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800&auto=format&fit=crop'],
    description: 'Detailed 3D printed architectural replica of Ayodhya Ram Mandir with warm LED glow.',
    isBestseller: true,
    isTrending: true,
    rating: 4.9,
    numReviews: 128
  },
  {
    _id: 'prod_2',
    name: 'Handcrafted Wooden Geometric Drop Earrings',
    slug: 'handcrafted-wooden-geometric-drop-earrings',
    category: 'cat_2',
    categoryName: 'Wooden Earrings',
    price: 399,
    originalPrice: 799,
    stock: 80,
    images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop'],
    description: 'Lightweight laser-cut wooden drop earrings with anti-allergic sterling silver hooks.',
    isBestseller: true,
    isTrending: false,
    rating: 4.8,
    numReviews: 64
  },
  {
    _id: 'prod_3',
    name: 'Personalized Engraved Wooden Photo Frame',
    slug: 'personalized-engraved-wooden-photo-frame',
    category: 'cat_3',
    categoryName: 'Photo Frame',
    price: 799,
    originalPrice: 1299,
    stock: 30,
    images: ['https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&auto=format&fit=crop'],
    description: 'Custom photo plaque engraved on premium solid teak wood.',
    isBestseller: true,
    isTrending: true,
    rating: 4.9,
    numReviews: 95
  },
  {
    _id: 'prod_4',
    name: 'Artisan Ceramic Flower Vase & Decor Set',
    slug: 'artisan-ceramic-flower-vase-decor-set',
    category: 'cat_1',
    categoryName: 'Home Decor',
    price: 999,
    originalPrice: 1699,
    stock: 25,
    images: ['https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop'],
    description: 'Minimalist Nordic ceramic vase pair perfect for modern living room decor.',
    isBestseller: false,
    isTrending: true,
    rating: 4.7,
    numReviews: 42
  }
];

const fallbackBanners = [
  {
    _id: 'banner_1',
    title: 'Celebrate Special Moments with Shri Maruti',
    subtitle: 'Express Same-Day Delivery Across 400+ Cities in India',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1600&auto=format&fit=crop',
    link: '/products',
    buttonText: 'Explore Gifts Now',
    type: 'hero',
    displayOrder: 1,
    isActive: true
  },
  {
    _id: 'banner_2',
    title: '3D Printed Mandir Collection',
    subtitle: 'Bring Home Divine Energy with LED Illuminated Mandirs',
    image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=1600&auto=format&fit=crop',
    link: '/products?category=3d-mandir',
    buttonText: 'Shop Mandir Collection',
    type: 'hero',
    displayOrder: 2,
    isActive: true
  }
];

const fallbackBlogs = [
  {
    _id: 'blog_1',
    title: '10 Unique Personalized Gifts to Surprise Your Loved Ones in 2026',
    slug: '10-unique-personalized-gifts-2026',
    excerpt: 'From 3D printed mandirs to custom engraved photo plaques, discover top trending gifts.',
    content: 'Full guide to selecting the best personalized gifts...',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop',
    author: 'Shri Maruti Editorial',
    category: 'Gifting Ideas',
    createdAt: new Date()
  }
];

const fallbackJobs = [
  {
    _id: 'job_1',
    title: 'Senior E-Commerce Operations Manager',
    department: 'Operations',
    location: 'Lucknow / Hybrid',
    type: 'Full-time',
    description: 'Lead supply chain, warehouse fulfillment, and vendor network across India.',
    isActive: true
  }
];

const fallbackCoupons = [
  {
    _id: 'coup_1',
    code: 'WELCOME50',
    discountType: 'flat',
    discountValue: 50,
    minOrderValue: 299,
    expiryDate: new Date('2026-12-31')
  },
  {
    _id: 'coup_2',
    code: 'SHRIMARUTI10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderValue: 499,
    expiryDate: new Date('2026-12-31')
  }
];

module.exports = {
  fallbackCategories,
  fallbackProducts,
  fallbackBanners,
  fallbackBlogs,
  fallbackJobs,
  fallbackCoupons
};
