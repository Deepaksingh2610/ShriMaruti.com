const mongoose = require('mongoose');

// Simple, high-speed in-memory store for 10,000+ concurrent requests
const cacheStore = new Map();

const getCache = (key) => {
  const item = cacheStore.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    cacheStore.delete(key);
    return null;
  }
  return item.value;
};

const setCache = (key, value, ttlSeconds = 60) => {
  cacheStore.set(key, {
    value,
    expiry: Date.now() + ttlSeconds * 1000
  });
};

const clearCache = (prefix = '') => {
  if (!prefix) {
    cacheStore.clear();
    return;
  }
  for (const key of cacheStore.keys()) {
    if (key.startsWith(prefix)) {
      cacheStore.delete(key);
    }
  }
};

const isDbConnected = () => {
  return mongoose.connection && mongoose.connection.readyState === 1;
};

module.exports = {
  getCache,
  setCache,
  clearCache,
  isDbConnected,
  cacheStore
};
