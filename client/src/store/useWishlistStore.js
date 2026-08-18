import { create } from 'zustand';

export const useWishlistStore = create((set, get) => ({
  wishlist: JSON.parse(localStorage.getItem('wishlist')) || [],

  toggleWishlist: (product) => {
    const current = get().wishlist;
    const exists = current.some(item => (item._id || item.id) === (product._id || product.id));

    let updated = [];
    if (exists) {
      updated = current.filter(item => (item._id || item.id) !== (product._id || product.id));
    } else {
      updated = [...current, product];
    }
    localStorage.setItem('wishlist', JSON.stringify(updated));
    set({ wishlist: updated });
  },

  isInWishlist: (productId) => {
    return get().wishlist.some(item => (item._id || item.id) === productId);
  }
}));
