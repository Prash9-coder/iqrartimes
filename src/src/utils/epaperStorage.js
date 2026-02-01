// src/utils/epaperStorage.js

import { getAllEditions } from '../data/epaperData';

class EPaperStorageService {
    constructor() {
        this.storageKey = 'epaperUploads';
        this.backupStorageKey = 'epaperBackup';
        this.dbName = 'EpaperImagesDB';
        this.dbVersion = 1;
        this.storeName = 'images';
        this.db = null;

        // Initialize IndexedDB
        this.initDB();
    }

    // ==================== IndexedDB Setup ====================

    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('IndexedDB error:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                if (import.meta.env.DEV) console.log('✅ IndexedDB initialized');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: 'id' });
                    if (import.meta.env.DEV) console.log('✅ Object store created');
                }
            };
        });
    }

    async ensureDB() {
        if (!this.db) {
            await this.initDB();
        }
        return this.db;
    }

    // ==================== Image Storage (IndexedDB) ====================

    async saveImages(epaperKey, images) {
        try {
            const db = await this.ensureDB();
            const tx = db.transaction(this.storeName, 'readwrite');
            const store = tx.objectStore(this.storeName);

            // Save each image
            for (const img of images) {
                await new Promise((resolve, reject) => {
                    const request = store.put({
                        id: `${epaperKey}-page-${img.pageNumber}`,
                        epaperKey,
                        pageNumber: img.pageNumber,
                        preview: img.preview,
                        name: img.name,
                        size: img.size,
                        savedAt: new Date().toISOString()
                    });
                    request.onsuccess = resolve;
                    request.onerror = () => reject(request.error);
                });
            }

            return true;
        } catch (error) {
            console.error('Error saving images:', error);
            return false;
        }
    }

    async getImages(epaperKey) {
        try {
            const db = await this.ensureDB();
            const tx = db.transaction(this.storeName, 'readonly');
            const store = tx.objectStore(this.storeName);

            return new Promise((resolve, reject) => {
                const request = store.getAll();
                request.onsuccess = () => {
                    const images = request.result.filter(img => img.epaperKey === epaperKey);
                    resolve(images.sort((a, b) => a.pageNumber - b.pageNumber));
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error getting images:', error);
            return [];
        }
    }

    async deleteImages(epaperKey) {
        try {
            const db = await this.ensureDB();
            const tx = db.transaction(this.storeName, 'readwrite');
            const store = tx.objectStore(this.storeName);

            // Get all images for this epaper
            const allImages = await this.getImages(epaperKey);

            // Delete each image
            for (const img of allImages) {
                await new Promise((resolve, reject) => {
                    const request = store.delete(img.id);
                    request.onsuccess = resolve;
                    request.onerror = () => reject(request.error);
                });
            }

            return true;
        } catch (error) {
            console.error('Error deleting images:', error);
            return false;
        }
    }

    // ==================== Metadata Storage (localStorage) ====================

    getAllEpapers() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error reading epapers:', error);
            return [];
        }
    }

    getEpaper(editionId, date) {
        const allEpapers = this.getAllEpapers();
        return allEpapers.find(e => e.edition === editionId && e.date === date);
    }

    async saveEpaper(epaperData) {
        try {
            const epaperKey = `${epaperData.edition}-${epaperData.date}`;

            // Save images to IndexedDB
            if (epaperData.pages && epaperData.pages.length > 0) {
                await this.saveImages(epaperKey, epaperData.pages);
            }

            // Prepare metadata (without heavy image data for localStorage)
            const metadata = {
                ...epaperData,
                pages: epaperData.pages.map(p => ({
                    pageNumber: p.pageNumber,
                    name: p.name,
                    size: p.size,
                    // Keep preview for thumbnails in admin panel
                    preview: p.preview
                }))
            };

            // Save metadata to localStorage
            const allEpapers = this.getAllEpapers();
            const existingIndex = allEpapers.findIndex(
                e => e.edition === epaperData.edition && e.date === epaperData.date
            );

            if (existingIndex >= 0) {
                allEpapers[existingIndex] = metadata;
            } else {
                allEpapers.unshift(metadata);
            }

            localStorage.setItem(this.storageKey, JSON.stringify(allEpapers));
            this.createBackup();

            if (import.meta.env.DEV) console.log('✅ E-Paper saved:', epaperKey);
            return true;
        } catch (error) {
            console.error('Error saving epaper:', error);
            return false;
        }
    }

    async deleteEpaper(id) {
        try {
            const allEpapers = this.getAllEpapers();
            const epaper = allEpapers.find(e => e.id === id);

            if (epaper) {
                // Delete images from IndexedDB
                const epaperKey = `${epaper.edition}-${epaper.date}`;
                await this.deleteImages(epaperKey);
            }

            // Remove from localStorage
            const filtered = allEpapers.filter(e => e.id !== id);
            localStorage.setItem(this.storageKey, JSON.stringify(filtered));
            this.createBackup();

            return true;
        } catch (error) {
            console.error('Error deleting epaper:', error);
            return false;
        }
    }

    // ==================== For Viewer - Get Pages ====================

    async getPagesForViewer(editionId, date) {
        const epaperKey = `${editionId}-${date}`;
        const images = await this.getImages(epaperKey);

        if (images.length > 0) {
            return images.map(img => ({
                id: img.id,
                pageNumber: img.pageNumber,
                thumbnail: img.preview,
                fullImage: img.preview,
                hdImage: img.preview,
                title: this.getPageTitle(img.pageNumber, images.length),
                isPdf: false
            }));
        }

        return null; // No images found, use fallback
    }

    getPageTitle(pageNum, total) {
        if (pageNum === 1) return 'Front Page';
        if (pageNum === total) return 'Back Page';
        if (pageNum === 2) return 'City';
        if (pageNum === 3) return 'State';
        return `Page ${pageNum}`;
    }

    // ==================== Backup & Restore ====================

    createBackup() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (data) {
                localStorage.setItem(this.backupStorageKey, data);
                localStorage.setItem(`${this.backupStorageKey}_timestamp`, Date.now().toString());
            }
        } catch (error) {
            console.error('Backup error:', error);
        }
    }

    restoreFromBackup() {
        try {
            const backupData = localStorage.getItem(this.backupStorageKey);
            if (backupData) {
                localStorage.setItem(this.storageKey, backupData);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Restore error:', error);
            return false;
        }
    }

    getBackupInfo() {
        try {
            const backupData = localStorage.getItem(this.backupStorageKey);
            const timestamp = localStorage.getItem(`${this.backupStorageKey}_timestamp`);

            return {
                hasBackup: !!backupData,
                timestamp: timestamp ? new Date(parseInt(timestamp)) : null,
                count: backupData ? JSON.parse(backupData).length : 0
            };
        } catch (error) {
            return { hasBackup: false, timestamp: null, count: 0 };
        }
    }

    // ==================== Export / Import ====================

    exportData() {
        const data = this.getAllEpapers();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        return blob;
    }

    async importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (!Array.isArray(data)) {
                        throw new Error('Invalid format');
                    }

                    const existing = this.getAllEpapers();
                    const merged = [...data, ...existing];

                    const unique = merged.filter((epaper, index, arr) => {
                        return arr.findIndex(e =>
                            e.edition === epaper.edition && e.date === epaper.date
                        ) === index;
                    });

                    localStorage.setItem(this.storageKey, JSON.stringify(unique));
                    this.createBackup();
                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    // ==================== Utilities ====================

    clearAll() {
        try {
            localStorage.removeItem(this.storageKey);
            localStorage.removeItem(this.backupStorageKey);
            localStorage.removeItem(`${this.backupStorageKey}_timestamp`);

            // Clear IndexedDB
            if (this.db) {
                const tx = this.db.transaction(this.storeName, 'readwrite');
                tx.objectStore(this.storeName).clear();
            }

            return true;
        } catch (error) {
            console.error('Clear error:', error);
            return false;
        }
    }

    getStats() {
        const allEpapers = this.getAllEpapers();
        const editions = new Set(allEpapers.map(e => e.edition));

        return {
            totalEpapers: allEpapers.length,
            totalPages: allEpapers.reduce((acc, e) => acc + (e.pagesCount || 0), 0),
            editions: editions.size,
            editionsList: Array.from(editions)
        };
    }

    validateEpaperData(data) {
        const required = ['edition', 'date', 'pages'];
        const missing = required.filter(field => !data[field]);

        if (missing.length > 0) {
            return { valid: false, error: `Missing: ${missing.join(', ')}` };
        }

        if (!Array.isArray(data.pages) || data.pages.length === 0) {
            return { valid: false, error: 'Pages required' };
        }

        return { valid: true };
    }
}

// Export singleton
export const epaperStorage = new EPaperStorageService();

// Backward compatibility exports
export const getSavedEpaper = (editionId, date) => epaperStorage.getEpaper(editionId, date);
export const getAllSavedEpapers = () => epaperStorage.getAllEpapers();
export const saveEpaper = (epaperData) => epaperStorage.saveEpaper(epaperData);
export const deleteEpaper = (id) => epaperStorage.deleteEpaper(id);
export const getEpaperStats = () => epaperStorage.getStats();