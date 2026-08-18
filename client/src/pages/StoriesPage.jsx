import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import API from '../services/api';
import SEOHead from '../components/SEOHead';
import { BookOpen, Calendar, ArrowRight, Sparkles, Tag, X, Clock } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Gifting Ideas',
  'Celebration Ideas',
  'Festival Guides',
  'Corporate Gifting',
  'Product Stories',
  'Behind the Scenes',
  'Shri Maruti Updates'
];

const CURATED_STORIES = [
  {
    _id: 'story_1',
    title: 'The Art of Thoughtful Gifting: How Personalization Elevates Every Celebration',
    slug: 'art-of-thoughtful-gifting-personalization',
    category: 'Gifting Ideas',
    excerpt: 'Exploring why personalized engraved keepsakes and customized 3D frames create lasting emotional memories that off-the-shelf gifts simply cannot match.',
    content: 'When we give a gift, we are doing more than exchanging an object; we are sharing an emotion, celebrating a milestone, and acknowledging a connection. Thoughtful personalization transforms ordinary items into cherished keepsakes. In this guide, we explore the science and sentiment behind selecting memorable gifts for birthdays, anniversaries, and personal milestones.',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop',
    publishedDate: '2026-01-15'
  },
  {
    _id: 'story_2',
    title: 'Festival Gifting Guide: Crafting Memorable Festive Hampers for Families',
    slug: 'festival-gifting-guide-hampers',
    category: 'Festival Guides',
    excerpt: 'A comprehensive guide to pairing handcrafted sweets, artisanal diya sets, and bespoke decor for authentic Indian festive celebrations.',
    content: 'Festivals bring families together across geographical distances. Selecting the right hamper involves balancing traditional auspicious elements with contemporary gourmet selections. Learn our curated approach to designing hampers that delight every generation.',
    image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop',
    publishedDate: '2026-01-20'
  },
  {
    _id: 'story_3',
    title: 'Precision in Light: The Engineering Behind 3D Optical Illusion Lamps',
    slug: 'precision-light-3d-illusion-lamps',
    category: 'Product Stories',
    excerpt: 'A peek into the laser engraving, acrylic refractive grading, and warm LED engineering powering Shri Maruti 3D Studio creations.',
    content: 'Creating a 3D illusion lamp requires high-precision laser engraving on optical-grade acrylic sheets. When light enters from the solid wooden LED base, it follows micro-engraved contours to generate astonishing three-dimensional depth in a flat medium.',
    image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800&auto=format&fit=crop',
    publishedDate: '2026-02-01'
  },
  {
    _id: 'story_4',
    title: 'Behind the Scenes: Inside the Shri Maruti Studio & Workshop',
    slug: 'inside-shri-maruti-studio-workshop',
    category: 'Behind the Scenes',
    excerpt: 'Step inside our workshop to see how every custom frame, floral arrangement, and gift wrap is inspected with meticulous attention to detail.',
    content: 'Quality control is central to our operation. From initial vector design review to final protective cushioning and wax-seal gift packaging, our team inspects every element before handover to express logistics partners.',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop',
    publishedDate: '2026-02-10'
  }
];

const StoriesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeStory, setActiveStory] = useState(null);

  const { data: dbBlogs = [] } = useQuery({
    queryKey: ['storiesBlogs'],
    queryFn: async () => {
      try {
        const res = await API.get('/content/blogs');
        return res.data.blogs || [];
      } catch {
        return [];
      }
    }
  });

  // Combine DB articles with curated non-speculative stories
  const allArticles = dbBlogs.length > 0 ? dbBlogs : CURATED_STORIES;

  const filteredArticles = selectedCategory === 'All'
    ? allArticles
    : allArticles.filter(a => a.category?.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <SEOHead
        title="Shri Maruti Stories - Ideas, Guides & Inspiration"
        description="Discover stories, ideas, inspiration, gifting guides, celebration tips, product highlights, and updates from Shri Maruti."
      />

      {/* Breadcrumb */}
      <nav className="text-xs text-slate-500 flex items-center gap-2">
        <Link to="/" className="hover:text-amber-600">Home</Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">Shri Maruti Stories</span>
      </nav>

      {/* Header */}
      <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 shadow-xl border border-slate-800 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-full border border-amber-500/30">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Editorial & Guides</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          Shri Maruti Stories
        </h1>
        <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
          Discover stories, ideas, inspiration, gifting guides, celebration tips, product highlights, and updates from Shri Maruti.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition duration-150 ${
              selectedCategory === cat
                ? 'bg-amber-500 text-neutral-950 shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Article Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((article) => (
          <article
            key={article._id || article.slug}
            className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between group"
          >
            <div>
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <img
                  src={article.image || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop'}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  loading="lazy"
                />
                <span className="absolute top-3 left-3 bg-neutral-900/80 backdrop-blur-sm text-amber-400 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {article.category || 'Story'}
                </span>
              </div>

              <div className="p-6 space-y-2.5">
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {article.publishedDate || (article.createdAt ? new Date(article.createdAt).toISOString().split('T')[0] : '2026')}
                  </span>
                </div>

                <h2 className="text-base font-bold text-slate-900 group-hover:text-amber-700 transition leading-snug line-clamp-2">
                  {article.title}
                </h2>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {article.excerpt || article.description}
                </p>
              </div>
            </div>

            <div className="px-6 pb-6 pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setActiveStory(article)}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 inline-flex items-center gap-1.5 transition"
              >
                Read More
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </article>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-2">
          <p className="text-sm font-bold text-slate-800">No stories found in this category.</p>
          <p className="text-xs text-slate-500">Please select another category or view all stories.</p>
        </div>
      )}

      {/* Story Detail Modal */}
      {activeStory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  {activeStory.category}
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">{activeStory.title}</h2>
              </div>
              <button
                onClick={() => setActiveStory(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100">
              <img
                src={activeStory.image}
                alt={activeStory.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4">
              <p className="font-medium text-slate-800">{activeStory.excerpt}</p>
              <p>{activeStory.content}</p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Shri Maruti Editorial</span>
              <button
                onClick={() => setActiveStory(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl"
              >
                Close Story
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoriesPage;
