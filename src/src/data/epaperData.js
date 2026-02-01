// src/data/epaperData.js
import epaperApi from '../api/epaperApi';

// ✅ S3 Base URL - Your S3 bucket
const S3_BASE_URL = 'https://iqrar-times.s3.ap-south-1.amazonaws.com';

// ==================== EDITION CATEGORIES ====================
export const editionCategories = [
    {
        id: 'main',
        name: 'MAIN EDITIONS',
        nameLocal: 'मुख्य संस्करण',
        color: '#e31e24',
        editions: [
            { id: 'delhi', name: 'Delhi', nameLocal: 'दिल्ली', pagesCount: 8 },
            { id: 'national', name: 'National', nameLocal: 'राष्ट्रीय', pagesCount: 28 },
        ]
    },
    {
        id: 'andhra-pradesh',
        name: 'ANDHRA PRADESH',
        nameLocal: 'आंध्र प्रदेश',
        color: '#1a73e8',
        editions: [
            { id: 'vijayawada', name: 'Vijayawada', nameLocal: 'విజయవాడ', pagesCount: 24 },
            { id: 'visakhapatnam', name: 'Visakhapatnam', nameLocal: 'విశాఖపట్నం', pagesCount: 20 },
            { id: 'tirupati', name: 'Tirupati', nameLocal: 'తిరుపతి', pagesCount: 18 },
            { id: 'guntur', name: 'Guntur', nameLocal: 'గుంటూరు', pagesCount: 16 },
            { id: 'rajahmundry', name: 'Rajahmundry', nameLocal: 'రాజమండ్రి', pagesCount: 16 },
            { id: 'nellore', name: 'Nellore', nameLocal: 'నెల్లూరు', pagesCount: 14 },
            { id: 'kurnool', name: 'Kurnool', nameLocal: 'కర్నూలు', pagesCount: 14 },
            { id: 'anantapur', name: 'Anantapur', nameLocal: 'అనంతపురం', pagesCount: 12 },
            { id: 'kadapa', name: 'Kadapa', nameLocal: 'కడప', pagesCount: 12 },
            { id: 'ongole', name: 'Ongole', nameLocal: 'ఒంగోలు', pagesCount: 12 },
            { id: 'eluru', name: 'Eluru', nameLocal: 'ఏలూరు', pagesCount: 12 },
            { id: 'srikakulam', name: 'Srikakulam', nameLocal: 'శ్రీకాకుళం', pagesCount: 10 },
        ]
    },
    {
        id: 'telangana',
        name: 'TELANGANA',
        nameLocal: 'తెలంగాణ',
        color: '#ff9800',
        editions: [
            { id: 'hyderabad', name: 'Hyderabad', nameLocal: 'హైదరాబాద్', pagesCount: 28 },
            { id: 'warangal', name: 'Warangal', nameLocal: 'వరంగల్', pagesCount: 16 },
            { id: 'karimnagar', name: 'Karimnagar', nameLocal: 'కరీంనగర్', pagesCount: 14 },
            { id: 'khammam', name: 'Khammam', nameLocal: 'ఖమ్మం', pagesCount: 14 },
            { id: 'nizamabad', name: 'Nizamabad', nameLocal: 'నిజామాబాద్', pagesCount: 12 },
            { id: 'nalgonda', name: 'Nalgonda', nameLocal: 'నల్గొండ', pagesCount: 12 },
            { id: 'mahabubnagar', name: 'Mahabubnagar', nameLocal: 'మహబూబ్‌నగర్', pagesCount: 12 },
            { id: 'adilabad', name: 'Adilabad', nameLocal: 'ఆదిలాబాద్', pagesCount: 10 },
        ]
    },
    {
        id: 'metro',
        name: 'METRO',
        nameLocal: 'మెట్రో',
        color: '#9c27b0',
        editions: [
            { id: 'hyderabad-metro', name: 'Hyderabad Metro', nameLocal: 'హైదరాబాద్ మెట్రో', pagesCount: 8 },
            { id: 'vijayawada-metro', name: 'Vijayawada Metro', nameLocal: 'విజయవాడ మెట్రో', pagesCount: 8 },
            { id: 'vizag-metro', name: 'Vizag Metro', nameLocal: 'విశాఖ మెట్రో', pagesCount: 8 },
        ]
    },
    {
        id: 'magazines',
        name: 'MAGAZINES',
        nameLocal: 'మ్యాగజీన్లు',
        color: '#4caf50',
        editions: [
            { id: 'funday', name: 'Funday', nameLocal: 'ఫన్‌డే', pagesCount: 16, isWeekly: true },
            { id: 'navya', name: 'Navya', nameLocal: 'నవ్య', pagesCount: 24, isWeekly: true },
            { id: 'family', name: 'Family', nameLocal: 'ఫ్యామిలీ', pagesCount: 20, isWeekly: true },
            { id: 'sakshi-sport', name: 'Sakshi Sport', nameLocal: 'సాక్షి స్పోర్ట్', pagesCount: 12 },
            { id: 'business', name: 'Business', nameLocal: 'బిజినెస్', pagesCount: 12 },
        ]
    },
];

// ==================== HELPERS ====================
export const getAllEditions = () => {
    const allEditions = [];
    editionCategories.forEach(category => {
        category.editions.forEach(edition => {
            allEditions.push({
                ...edition,
                category: category.name,
                categoryLocal: category.nameLocal,
                categoryId: category.id,
                categoryColor: category.color,
            });
        });
    });
    return allEditions;
};

export const findEditionById = (editionId) => {
    for (const category of editionCategories) {
        const edition = category.editions.find(e => e.id === editionId);
        if (edition) {
            return {
                ...edition,
                category: category.name,
                categoryLocal: category.nameLocal,
                categoryId: category.id,
                categoryColor: category.color,
            };
        }
    }
    return null;
};

// ==================== DATE HELPERS ====================
export const getAvailableDates = () => {
    const dates = [];
    for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        dates.push({
            date,
            value: date.toISOString().split('T')[0],
            day: date.getDate(),
            month: date.toLocaleDateString('en-US', { month: 'short' }),
            year: date.getFullYear(),
            weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
            displayDate: date.toLocaleDateString('en-US', {
                day: '2-digit', month: 'short', year: 'numeric'
            }),
            isToday: i === 0,
        });
    }
    return dates;
};

// ==================== PAGE LABEL ====================
export const getPageLabel = (pageNum, total) => {
    if (pageNum === 1) return 'Front Page';
    if (pageNum === total) return 'Last Page';
    if (pageNum === 2) return 'City';
    if (pageNum === 3) return 'State';
    if (pageNum <= 6) return 'District';
    if (pageNum <= 10) return 'National';
    if (pageNum <= 14) return 'International';
    if (pageNum <= 18) return 'Sports';
    return 'Classifieds';
};

// ✅ FIXED: Helper to get FULL image URL from S3
const getFullImageUrl = (item) => {
    // Try all possible field names
    const path = item?.image ||
        item?.file_url ||
        item?.fileUrl ||
        item?.image_url ||
        item?.imageUrl ||
        item?.thumbnail ||
        item?.url ||
        '';

    if (!path) {
        console.warn('⚠️ No image path found in:', item);
        return '';
    }

    // If already a full URL, return as is
    if (path.startsWith('http://') || path.startsWith('https://')) {
        console.log('✅ Already full URL:', path);
        return path;
    }

    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;

    // Build full S3 URL
    const fullUrl = `${S3_BASE_URL}/${cleanPath}`;
    console.log('🔗 Built URL:', fullUrl);

    return fullUrl;
};

// ==================== GENERATE PAGES FROM API ====================
export const generatePagesForEdition = async (editionId, pageCount = 8, date = null) => {
    const currentDate = date || new Date().toISOString().split('T')[0];
    const edition = findEditionById(editionId);
    const totalPages = edition?.pagesCount || pageCount;

    console.log(`\n📰 ===== LOADING E-PAPER =====`);
    console.log(`📍 Edition: ${editionId}`);
    console.log(`📅 Date: ${currentDate}`);
    console.log(`📄 Expected Pages: ${totalPages}`);

    try {
        // Fetch from API
        const result = await epaperApi.getByEditionAndDate(editionId, currentDate);

        if (result.success && Array.isArray(result.data) && result.data.length > 0) {
            console.log(`✅ API returned ${result.data.length} pages`);

            // Debug: Show first item
            console.log('📄 First item from API:', result.data[0]);

            // Map API data to page format with FULL URLs
            const pages = result.data
                .sort((a, b) => (a.page_number || 0) - (b.page_number || 0))
                .map((page, index) => {
                    const pageNum = page.page_number || index + 1;
                    const imageUrl = getFullImageUrl(page);

                    return {
                        id: page.id || `${editionId}-${pageNum}`,
                        pageNumber: pageNum,
                        thumbnail: imageUrl,
                        fullImage: imageUrl,
                        hdImage: imageUrl,
                        image: imageUrl,  // ✅ Added for compatibility
                        title: getPageLabel(pageNum, result.data.length),
                        date: page.date,
                        isFromApi: true,
                    };
                });

            console.log(`✅ Processed ${pages.length} pages`);
            console.log('📄 First processed page:', pages[0]);

            return pages;
        } else {
            console.log('⚠️ No pages from API for this date, using placeholders');
        }
    } catch (error) {
        console.error('❌ API Error:', error.message);
    }

    // Fallback: Generate placeholder pages
    console.log(`📁 Generating ${totalPages} placeholder pages`);

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        pages.push({
            id: `${editionId}-${currentDate}-${i}`,
            pageNumber: i,
            thumbnail: `https://via.placeholder.com/400x560/e0e0e0/666?text=Page+${i}`,
            fullImage: `https://via.placeholder.com/800x1120/e0e0e0/666?text=Page+${i}`,
            hdImage: `https://via.placeholder.com/1200x1680/e0e0e0/666?text=Page+${i}`,
            image: `https://via.placeholder.com/800x1120/e0e0e0/666?text=Page+${i}`,
            title: getPageLabel(i, totalPages),
            date: currentDate,
            isFromApi: false,
        });
    }

    return pages;
};

export default {
    editionCategories,
    getAllEditions,
    findEditionById,
    getAvailableDates,
    getPageLabel,
    generatePagesForEdition,
};