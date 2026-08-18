import React from 'react';
import { HeartHandshake } from 'lucide-react';

const defaultStories = [
  { id: 1, title: 'Handcrafted With Love', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&auto=format&fit=crop' },
  { id: 2, title: 'Fresh Morning Blooms', image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=400&auto=format&fit=crop' },
  { id: 3, title: 'Artisanal Bakery Cakes', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&auto=format&fit=crop' },
  { id: 4, title: 'Precision 3D Artistry', image: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=400&auto=format&fit=crop' },
  { id: 5, title: 'Eco Wooden Crafts', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&auto=format&fit=crop' },
  { id: 6, title: 'Velvet Gift Packaging', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&auto=format&fit=crop' },
  { id: 7, title: 'Pan-India Express', image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&auto=format&fit=crop' },
  { id: 8, title: '100% Delight Promise', image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400&auto=format&fit=crop' }
];

const BrandStorySection = ({ stories = defaultStories }) => {
  const displayStories = stories.length > 0 ? stories : defaultStories;

  return (
    <section className="my-12">
      <div className="text-center max-w-xl mx-auto mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-extrabold rounded-full uppercase tracking-wider mb-2">
          <HeartHandshake className="w-3.5 h-3.5 text-amber-600" /> Our Promise
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          The GaneshGifting Story
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Every parcel holds emotion, every gift tells a story
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {displayStories.slice(0, 8).map((story) => (
          <div key={story.id || story._id} className="group relative rounded-2xl overflow-hidden shadow-sm aspect-[4/3] bg-slate-900">
            <img
              src={story.image}
              alt={story.title}
              className="w-full h-full object-cover group-hover:scale-110 transition duration-500 opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex items-end p-4">
              <span className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-400 transition">
                {story.title}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BrandStorySection;
