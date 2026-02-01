// src/utils/updateViews.js - Script to update views count for news articles
import axios from 'axios';

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.iqrartimes.com';

// Articles data with new views count
const articlesToUpdate = [
    { id: '0d3fc8ca-5a4d-451b-b1d4-4eae49ec3a99', views_count: 4471 },
    { id: '55bd2870-912f-4410-afd3-5183244515f3', views_count: 5789 },
    { id: '0729df3d-a495-4867-895c-1761869369e3', views_count: 4423 },
    { id: 'e53fb658-e2e3-4fc5-9fd1-56705da09ce6', views_count: 5212 }
];

// Function to update views count
const updateViewsCount = async (id, viewsCount) => {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.error('❌ No auth token found. Please login first.');
            return false;
        }

        const cleanToken = token.replace(/^Bearer\s+/i, '').trim();

        const response = await axios.put(
            `${API_BASE_URL}/backoffice/news/${id}`,
            { views_count: viewsCount },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${cleanToken}`
                },
                withCredentials: true
            }
        );

        console.log(`✅ Updated ${id}: views_count = ${viewsCount}`);
        return true;
    } catch (error) {
        console.error(`❌ Failed to update ${id}:`, error.response?.data || error.message);
        return false;
    }
};

// Main function to update all articles
const updateAllViews = async () => {
    console.log('🚀 Starting views count update for', articlesToUpdate.length, 'articles...');

    let successCount = 0;
    let failCount = 0;

    for (const article of articlesToUpdate) {
        const success = await updateViewsCount(article.id, article.views_count);
        if (success) {
            successCount++;
        } else {
            failCount++;
        }
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('📊 Update complete:');
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
};

// Export for use in browser console or as module
export { updateAllViews, updateViewsCount };

// Auto-run if this script is executed directly
if (typeof window !== 'undefined') {
    // Browser environment - make it available globally
    window.updateAllViews = updateAllViews;
    window.updateViewsCount = updateViewsCount;
    console.log('🔧 Views update functions loaded. Run updateAllViews() to start.');
} else {
    // Node.js environment
    updateAllViews();
}