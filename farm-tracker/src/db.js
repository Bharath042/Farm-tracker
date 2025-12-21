// Local database using localStorage and IndexedDB
// This module handles all data persistence for the farm tracker

const DB_NAME = 'FarmTrackerDB';
const DB_VERSION = 2;

// Initialize database
export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create object stores
      if (!db.objectStoreNames.contains('categories')) {
        db.createObjectStore('categories', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('expenses')) {
        db.createObjectStore('expenses', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('milestones')) {
        db.createObjectStore('milestones', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('farmData')) {
        db.createObjectStore('farmData', { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains('subcategories')) {
        db.createObjectStore('subcategories', { keyPath: 'id' });
      }
    };
  });
};

// Get database instance
let dbInstance = null;

export const getDB = async () => {
  if (!dbInstance) {
    dbInstance = await initDB();
  }
  return dbInstance;
};

// CRUD Operations for Categories
export const addCategory = async (category) => {
  const db = await getDB();
  const tx = db.transaction('categories', 'readwrite');
  const store = tx.objectStore('categories');
  category.id = Date.now().toString();
  category.createdAt = new Date().toISOString();
  return new Promise((resolve, reject) => {
    const request = store.add(category);
    request.onsuccess = () => resolve(category);
    request.onerror = () => reject(request.error);
  });
};

export const getCategories = async () => {
  const db = await getDB();
  const tx = db.transaction('categories', 'readonly');
  const store = tx.objectStore('categories');
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const updateCategory = async (category) => {
  const db = await getDB();
  const tx = db.transaction('categories', 'readwrite');
  const store = tx.objectStore('categories');
  return new Promise((resolve, reject) => {
    const request = store.put(category);
    request.onsuccess = () => resolve(category);
    request.onerror = () => reject(request.error);
  });
};

export const deleteCategory = async (categoryId) => {
  const db = await getDB();
  const tx = db.transaction('categories', 'readwrite');
  const store = tx.objectStore('categories');
  return new Promise((resolve, reject) => {
    const request = store.delete(categoryId);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// CRUD Operations for Expenses
export const addExpense = async (expense) => {
  const db = await getDB();
  const tx = db.transaction('expenses', 'readwrite');
  const store = tx.objectStore('expenses');
  expense.id = Date.now().toString();
  expense.createdAt = new Date().toISOString();
  return new Promise((resolve, reject) => {
    const request = store.add(expense);
    request.onsuccess = () => resolve(expense);
    request.onerror = () => reject(request.error);
  });
};

export const getExpenses = async () => {
  const db = await getDB();
  const tx = db.transaction('expenses', 'readonly');
  const store = tx.objectStore('expenses');
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const updateExpense = async (expense) => {
  const db = await getDB();
  const tx = db.transaction('expenses', 'readwrite');
  const store = tx.objectStore('expenses');
  return new Promise((resolve, reject) => {
    const request = store.put(expense);
    request.onsuccess = () => resolve(expense);
    request.onerror = () => reject(request.error);
  });
};

export const deleteExpense = async (expenseId) => {
  const db = await getDB();
  const tx = db.transaction('expenses', 'readwrite');
  const store = tx.objectStore('expenses');
  return new Promise((resolve, reject) => {
    const request = store.delete(expenseId);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// CRUD Operations for Milestones
export const addMilestone = async (milestone) => {
  const db = await getDB();
  const tx = db.transaction('milestones', 'readwrite');
  const store = tx.objectStore('milestones');
  milestone.id = Date.now().toString();
  milestone.createdAt = new Date().toISOString();
  return new Promise((resolve, reject) => {
    const request = store.add(milestone);
    request.onsuccess = () => resolve(milestone);
    request.onerror = () => reject(request.error);
  });
};

export const getMilestones = async () => {
  const db = await getDB();
  const tx = db.transaction('milestones', 'readonly');
  const store = tx.objectStore('milestones');
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const deleteMilestone = async (milestoneId) => {
  const db = await getDB();
  const tx = db.transaction('milestones', 'readwrite');
  const store = tx.objectStore('milestones');
  return new Promise((resolve, reject) => {
    const request = store.delete(milestoneId);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// Farm Data (metadata like farm name, location, etc.)
export const saveFarmData = async (data) => {
  const db = await getDB();
  const tx = db.transaction('farmData', 'readwrite');
  const store = tx.objectStore('farmData');
  data.key = 'farmMetadata';
  data.updatedAt = new Date().toISOString();
  return new Promise((resolve, reject) => {
    const request = store.put(data);
    request.onsuccess = () => resolve(data);
    request.onerror = () => reject(request.error);
  });
};

export const getFarmData = async () => {
  const db = await getDB();
  const tx = db.transaction('farmData', 'readonly');
  const store = tx.objectStore('farmData');
  return new Promise((resolve, reject) => {
    const request = store.get('farmMetadata');
    request.onsuccess = () => resolve(request.result || {});
    request.onerror = () => reject(request.error);
  });
};

// CRUD Operations for SubCategories
export const addSubCategory = async (subcategory) => {
  const db = await getDB();
  const tx = db.transaction('subcategories', 'readwrite');
  const store = tx.objectStore('subcategories');
  subcategory.id = Date.now().toString();
  subcategory.createdAt = new Date().toISOString();
  return new Promise((resolve, reject) => {
    const request = store.add(subcategory);
    request.onsuccess = () => resolve(subcategory);
    request.onerror = () => reject(request.error);
  });
};

export const getSubCategories = async () => {
  const db = await getDB();
  const tx = db.transaction('subcategories', 'readonly');
  const store = tx.objectStore('subcategories');
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const updateSubCategory = async (subcategory) => {
  const db = await getDB();
  const tx = db.transaction('subcategories', 'readwrite');
  const store = tx.objectStore('subcategories');
  return new Promise((resolve, reject) => {
    const request = store.put(subcategory);
    request.onsuccess = () => resolve(subcategory);
    request.onerror = () => reject(request.error);
  });
};

export const deleteSubCategory = async (subcategoryId) => {
  const db = await getDB();
  const tx = db.transaction('subcategories', 'readwrite');
  const store = tx.objectStore('subcategories');
  return new Promise((resolve, reject) => {
    const request = store.delete(subcategoryId);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};
