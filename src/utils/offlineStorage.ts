/**
 * Utility for managing offline data storage
 * DEPRECATED: All methods now log warnings and do not perform local storage operations
 */

// Generic get function - now returns empty arrays
export const getItems = <T>(storeName: string): T[] => {
  console.warn(`DEPRECATED: getItems(${storeName}) - Offline mode is disabled. Please use Supabase directly.`);
  return [];
};

// Generic add function - now returns a mock item with warning
export const addItem = <T>(storeName: string, item: T): T => {
  console.warn(`DEPRECATED: addItem(${storeName}) - Offline mode is disabled. Please use Supabase directly.`);
  console.warn('Not saving item locally:', item);
  return {
    ...item,
    id: 'offline-mode-disabled',
  } as T;
};

// Generic update function - now returns the item unchanged with warning
export const updateItem = <T extends { id: string }>(storeName: string, item: T): T => {
  console.warn(`DEPRECATED: updateItem(${storeName}) - Offline mode is disabled. Please use Supabase directly.`);
  console.warn('Not updating item locally:', item);
  return item;
};

// Generic delete function - now returns false with warning
export const deleteItem = <T extends { id: string }>(storeName: string, id: string): boolean => {
  console.warn(`DEPRECATED: deleteItem(${storeName}, ${id}) - Offline mode is disabled. Please use Supabase directly.`);
  return false;
};

// Data backup function - now returns empty JSON
export const backupData = (): string => {
  console.warn('DEPRECATED: backupData() - Offline mode is disabled. Please use Supabase directly.');
  return 'data:text/json;charset=utf-8,{}';
};

// Data restore function - now returns false with warning
export const restoreData = (jsonData: string): boolean => {
  console.warn('DEPRECATED: restoreData() - Offline mode is disabled. Please use Supabase directly.');
  return false;
};

// Export store names for backward compatibility
export const STORE_NAMES = {
  PRODUCTS: "demo_products",
  BILLS: "demo_bills",
  INVENTORY: "demo_inventory",
  USERS: "demo_users",
  SETTINGS: "demo_settings",
};

// Initialize default settings - now a no-op
export const initializeSettings = () => {
  console.warn('DEPRECATED: initializeSettings() - Offline mode is disabled. Please use Supabase directly.');
};

// Get application settings - now returns empty object
export const getSettings = (): Record<string, any> => {
  console.warn('DEPRECATED: getSettings() - Offline mode is disabled. Please use Supabase directly.');
  return {
    offlineMode: false,
    businessName: "Vivaas",
    businessAddress: "Shiv Park Phase 2 Shop No-6-7 Pune Solapur Road Lakshumi Colony Opposite HDFC Bank Near Angle School, Pune-412307",
    businessPhone: "+91 9657171777, +91 9765971717",
    businessEmail: "contact@vivaas.store",
  };
};

// Update application settings - now a no-op
export const updateSettings = (newSettings: Record<string, any>): Record<string, any> => {
  console.warn('DEPRECATED: updateSettings() - Offline mode is disabled. Please use Supabase directly.');
  return newSettings;
};
