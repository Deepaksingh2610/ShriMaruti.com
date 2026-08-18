import { create } from 'zustand';
import { useLocationStore } from './useLocationStore';

const TOKEN_KEY = 'gg_token';
const USER_KEY  = 'gg_user';

const initialUser = (() => {
  try { return JSON.parse(localStorage.getItem(USER_KEY)) || null; }
  catch { return null; }
})();

export const useAuthStore = create((set) => ({
  user:  initialUser,
  token: localStorage.getItem(TOKEN_KEY) || null,

  setAuth: (user, token) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    if (token) localStorage.setItem(TOKEN_KEY, token);
    set({ user, token });

    // Sync location from DB user data
    useLocationStore.getState().syncLocationFromUser(user);
  },

  logout: () => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    set({ user: null, token: null });
  }
}));

// On app load: sync location if user already in localStorage
if (initialUser) {
  setTimeout(() => {
    useLocationStore.getState().syncLocationFromUser(initialUser);
  }, 0);
}

