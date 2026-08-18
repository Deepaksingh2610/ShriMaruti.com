import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  cartItems: JSON.parse(localStorage.getItem('cartItems')) || [],
  isGiftWrapped: false,
  giftMessage: '',
  appliedCoupon: null,
  appliedGiftCard: null,
  usedLoyaltyPoints: 0,

  addToCart: (product, qty = 1, variant = null) => {
    const current = get().cartItems;
    const existingIndex = current.findIndex(
      item => item.product === (product._id || product.id) && item.variantName === (variant ? variant.name : null)
    );

    let updated = [];
    if (existingIndex > -1) {
      updated = [...current];
      updated[existingIndex].qty += qty;
    } else {
      updated = [
        ...current,
        {
          product: product._id || product.id,
          name: product.name,
          image: product.images ? product.images[0] : product.image,
          price: variant ? variant.price : product.price,
          qty,
          variantName: variant ? variant.name : null,
          categoryName: product.categoryName
        }
      ];
    }
    localStorage.setItem('cartItems', JSON.stringify(updated));
    set({ cartItems: updated });
  },

  updateQty: (productId, qty, variantName = null) => {
    if (qty <= 0) {
      get().removeFromCart(productId, variantName);
      return;
    }
    const updated = get().cartItems.map(item => {
      if (item.product === productId && item.variantName === variantName) {
        return { ...item, qty };
      }
      return item;
    });
    localStorage.setItem('cartItems', JSON.stringify(updated));
    set({ cartItems: updated });
  },

  removeFromCart: (productId, variantName = null) => {
    const updated = get().cartItems.filter(
      item => !(item.product === productId && item.variantName === variantName)
    );
    localStorage.setItem('cartItems', JSON.stringify(updated));
    set({ cartItems: updated });
  },

  clearCart: () => {
    localStorage.removeItem('cartItems');
    set({ cartItems: [], appliedCoupon: null, appliedGiftCard: null, usedLoyaltyPoints: 0 });
  },

  setGiftOptions: (isGiftWrapped, giftMessage) => set({ isGiftWrapped, giftMessage }),
  setAppliedCoupon: (coupon) => set({ appliedCoupon: coupon }),
  setAppliedGiftCard: (giftCard) => set({ appliedGiftCard: giftCard }),
  setUsedLoyaltyPoints: (points) => set({ usedLoyaltyPoints: points }),

  getItemsTotal: () => get().cartItems.reduce((acc, item) => acc + item.price * item.qty, 0),
  getItemCount: () => get().cartItems.reduce((acc, item) => acc + item.qty, 0)
}));
