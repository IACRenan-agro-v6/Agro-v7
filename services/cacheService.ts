
import { openDB, IDBPDatabase } from 'idb';
import { OfflineTask, IdentifiedPlant, CropPlan, MarketQuote } from '../types';

const DB_NAME = 'iac_farm_offline_db';
const DB_VERSION = 1;

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Store for tasks to be synced
      if (!db.objectStoreNames.contains('offline_tasks')) {
        db.createObjectStore('offline_tasks', { keyPath: 'id' });
      }
      // Cache for plant history
      if (!db.objectStoreNames.contains('plant_history_cache')) {
        db.createObjectStore('plant_history_cache', { keyPath: 'id' });
      }
      // Cache for crop plans
      if (!db.objectStoreNames.contains('crop_plans_cache')) {
        db.createObjectStore('crop_plans_cache', { keyPath: 'id' });
      }
      // Cache for market quotes
      if (!db.objectStoreNames.contains('market_quotes_cache')) {
        db.createObjectStore('market_quotes_cache', { keyPath: 'product' });
      }
    },
  });
};

export const cacheService = {
  // Offline Tasks (Queue)
  async saveOfflineTask(task: OfflineTask) {
    const db = await initDB();
    await db.put('offline_tasks', task);
  },

  async getPendingTasks(): Promise<OfflineTask[]> {
    const db = await initDB();
    const tasks = await db.getAll('offline_tasks');
    return tasks.filter(t => t.status === 'pending');
  },

  async markTaskSynced(id: string) {
    const db = await initDB();
    const task = await db.get('offline_tasks', id);
    if (task) {
      task.status = 'synced';
      await db.put('offline_tasks', task);
    }
  },

  // Caching Data
  async cachePlantHistory(plants: IdentifiedPlant[]) {
    const db = await initDB();
    const tx = db.transaction('plant_history_cache', 'readwrite');
    await tx.store.clear();
    for (const plant of plants) {
      await tx.store.put(plant);
    }
    await tx.done;
  },

  async getCachedPlantHistory(): Promise<IdentifiedPlant[]> {
    const db = await initDB();
    return db.getAll('plant_history_cache');
  },

  async cacheCropPlans(plans: CropPlan[]) {
    const db = await initDB();
    const tx = db.transaction('crop_plans_cache', 'readwrite');
    await tx.store.clear();
    for (const plan of plans) {
      // Plans might not have IDs, so we use cropName as key if needed or add one
      await tx.store.put({ ...plan, id: (plan as any).id || plan.cropName });
    }
    await tx.done;
  },

  async getCachedCropPlans(): Promise<CropPlan[]> {
    const db = await initDB();
    return db.getAll('crop_plans_cache');
  },

  async cacheMarketQuotes(quotes: MarketQuote[]) {
    const db = await initDB();
    const tx = db.transaction('market_quotes_cache', 'readwrite');
    await tx.store.clear();
    for (const quote of quotes) {
      await tx.store.put(quote);
    }
    await tx.done;
  },

  async getCachedMarketQuotes(): Promise<MarketQuote[]> {
    const db = await initDB();
    return db.getAll('market_quotes_cache');
  }
};
