// src/api/epaperApi.js
import api from './index';
import uploadApi from './uploadApi';

const epaperApi = {
    /**
     * GET all epapers
     */
    getAll: async () => {
        try {
            console.log('📥 Fetching all epapers...');
            const response = await api.get('/backoffice/epaper');
            const data = response.data?.data || response.data || [];
            console.log('✅ Epapers loaded:', Array.isArray(data) ? data.length : 0);
            return { success: true, data: Array.isArray(data) ? data : [] };
        } catch (error) {
            console.error('❌ Get All Error:', error.message);
            return { success: false, error: error.message, data: [] };
        }
    },

    /**
     * GET epaper by ID
     */
    getById: async (id) => {
        try {
            console.log('📥 Fetching epaper:', id);
            const response = await api.get(`/backoffice/epaper/${id}`);
            return { success: true, data: response.data?.data || response.data };
        } catch (error) {
            console.error('❌ Get By ID Error:', error.message);
            return { success: false, error: error.message };
        }
    },

    /**
     * GET epaper by edition and date
     */
    getByEditionAndDate: async (edition, date) => {
        try {
            console.log(`📥 Fetching epaper: edition=${edition}, date=${date}`);

            const response = await api.get('/backoffice/epaper');
            const allData = response.data?.data || response.data || [];

            if (!Array.isArray(allData) || allData.length === 0) {
                return { success: true, data: [] };
            }

            const filteredData = allData.filter(item => item.date === date);
            const sortedData = filteredData.sort((a, b) =>
                (a.page_number || 0) - (b.page_number || 0)
            );

            console.log(`✅ Filtered: ${sortedData.length} pages for date ${date}`);
            return { success: true, data: sortedData };
        } catch (error) {
            console.error('❌ Get By Edition/Date Error:', error.message);
            return { success: false, error: error.message, data: [] };
        }
    },

    /**
     * CREATE epaper page
     */
    create: async (image, date, pageNumber, edition = null) => {
        try {
            const payload = {
                image: image,
                date: date,
                page_number: parseInt(pageNumber, 10)
            };

            if (edition) {
                payload.edition = edition;
            }

            console.log('📤 Creating epaper:', payload);
            const response = await api.post('/backoffice/epaper', payload);

            return { success: true, data: response.data?.data || response.data };
        } catch (error) {
            console.error('❌ Create Error:', error);
            return { success: false, error: error.response?.data?.description || error.message };
        }
    },

    /**
     * UPDATE epaper - FIXED
     */
    update: async (id, updateData) => {
        try {
            console.log('📝 Updating epaper:', id, updateData);

            // Clean the data - remove undefined values
            const cleanData = {};
            if (updateData.image !== undefined) cleanData.image = updateData.image;
            if (updateData.date !== undefined) cleanData.date = updateData.date;
            if (updateData.page_number !== undefined) cleanData.page_number = parseInt(updateData.page_number, 10);
            if (updateData.edition !== undefined) cleanData.edition = updateData.edition;

            const response = await api.put(`/backoffice/epaper/${id}`, cleanData);

            console.log('✅ Update response:', response.data);
            return { success: true, data: response.data?.data || response.data };
        } catch (error) {
            console.error('❌ Update Error:', error);
            return {
                success: false,
                error: error.response?.data?.description || error.response?.data?.message || error.message
            };
        }
    },

    /**
     * DELETE epaper - FIXED
     */
    delete: async (id) => {
        try {
            console.log('🗑️ Deleting epaper:', id);

            const response = await api.delete(`/backoffice/epaper/${id}`);

            console.log('✅ Delete response:', response.status);
            return { success: true, message: 'Deleted successfully' };
        } catch (error) {
            console.error('❌ Delete Error:', error);
            return {
                success: false,
                error: error.response?.data?.description || error.response?.data?.message || error.message
            };
        }
    },

    /**
     * Upload single page
     */
    uploadPage: async (date, pageNumber, imageFile, edition = null, onProgress = null) => {
        try {
            console.log(`📰 Uploading: Page ${pageNumber}, Date: ${date}, Edition: ${edition}`);

            const uploadResult = await uploadApi.upload(imageFile, onProgress);
            if (!uploadResult.success) {
                return { success: false, error: uploadResult.error };
            }

            console.log('✅ S3 Upload done:', uploadResult.url);

            const createResult = await epaperApi.create(
                uploadResult.path || uploadResult.url,
                date,
                pageNumber,
                edition
            );

            if (!createResult.success) {
                return { success: false, error: createResult.error };
            }

            return {
                success: true,
                data: createResult.data,
                imageUrl: uploadResult.url
            };
        } catch (error) {
            console.error('❌ Upload Page Error:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * UPDATE page with new image
     */
    updatePage: async (id, date, pageNumber, imageFile, edition = null, onProgress = null) => {
        try {
            console.log(`📝 Updating: ID ${id}, Page ${pageNumber}, Date: ${date}`);

            let imageUrl = null;

            // If new image file provided, upload it first
            if (imageFile) {
                const uploadResult = await uploadApi.upload(imageFile, onProgress);
                if (!uploadResult.success) {
                    return { success: false, error: uploadResult.error };
                }
                imageUrl = uploadResult.path || uploadResult.url;
                console.log('✅ New image uploaded:', imageUrl);
            }

            // Prepare update data
            const updateData = {
                date: date,
                page_number: parseInt(pageNumber, 10)
            };

            if (imageUrl) {
                updateData.image = imageUrl;
            }

            if (edition) {
                updateData.edition = edition;
            }

            // Update the record
            const updateResult = await epaperApi.update(id, updateData);

            return updateResult;
        } catch (error) {
            console.error('❌ Update Page Error:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Upload multiple pages
     */
    uploadMultiplePages: async (date, files, edition = null, onProgress = null) => {
        const total = files.length;
        let success = 0;
        let failed = 0;
        const results = [];

        console.log(`\n📰 ===== UPLOADING ${total} PAGES =====`);
        console.log(`📅 Date: ${date}`);
        console.log(`📍 Edition: ${edition || 'none'}`);

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const pageNumber = i + 1;

            if (onProgress) {
                onProgress({
                    phase: 'uploading',
                    currentPage: pageNumber,
                    totalPages: total,
                    fileName: file.name,
                    overallProgress: Math.round((i / total) * 100)
                });
            }

            let result = await epaperApi.uploadPage(
                date,
                pageNumber,
                file,
                edition,
                (percent) => {
                    if (onProgress) {
                        onProgress({
                            phase: 'uploading',
                            currentPage: pageNumber,
                            totalPages: total,
                            fileName: file.name,
                            fileProgress: percent,
                            overallProgress: Math.round(((i + percent / 100) / total) * 100)
                        });
                    }
                }
            );

            if (!result.success) {
                console.log(`🔄 Retrying page ${pageNumber}...`);
                await new Promise(r => setTimeout(r, 2000));
                result = await epaperApi.uploadPage(date, pageNumber, file, edition, null);
            }

            if (result.success) {
                success++;
                console.log(`✅ Page ${pageNumber} done`);
            } else {
                failed++;
                console.error(`❌ Page ${pageNumber} failed:`, result.error);
            }

            results.push({ pageNumber, ...result });

            if (i < files.length - 1) {
                await new Promise(r => setTimeout(r, 500));
            }
        }

        if (onProgress) {
            onProgress({
                phase: 'complete',
                overallProgress: 100,
                summary: { success, failed }
            });
        }

        console.log(`\n📊 DONE: ✅ ${success} | ❌ ${failed}`);

        return {
            success: failed === 0,
            partial: success > 0 && failed > 0,
            results,
            summary: { total, success, failed }
        };
    }
};

export default epaperApi;