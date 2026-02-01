// amplify/functions/newsapi/handler.js

// In-memory storage for demo (replace with database in production)
let newsStorage = [];
let epaperStorage = [];
let nextId = 1;
let nextEpaperId = 1;

// Validation functions
function validateId(id) {
    if (!id || typeof id !== 'string' || id.trim() === '') {
        throw new Error('Invalid ID');
    }
}

function validateArticleData(data) {
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid data');
    }
    if (!data.title || typeof data.title !== 'string' || data.title.trim() === '') {
        throw new Error('Title is required and must be a non-empty string');
    }
    // Add more validations as needed, e.g., content, author, etc.
}

export const handler = async (event) => {
    // ✅ CORS Headers - TODO: Restrict 'Access-Control-Allow-Origin' to specific domains in production
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        const path = event.path || '';
        const method = event.httpMethod;

        console.log('📡 Request:', method, path);

        // GET /news/news - Get all news
        if (method === 'GET' && path === '/news/news') {
            const articles = newsStorage.filter(article => article.status === 'published');
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    data: articles,
                    total: articles.length
                })
            };
        }

        // GET /news/news/{id} - Get news by ID
        if (method === 'GET' && path.startsWith('/news/news/')) {
            const id = path.split('/').pop();
            try {
                validateId(id);
            } catch (error) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: error.message
                    })
                };
            }
            const article = newsStorage.find(a => a.id === id);
            if (!article) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: 'Article not found'
                    })
                };
            }
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    data: article
                })
            };
        }

        // TODO: Add authentication check for backoffice endpoints (e.g., verify JWT token)
        // POST /backoffice/news - Create news
        if (method === 'POST' && path === '/backoffice/news') {
            const body = JSON.parse(event.body || '{}');
            try {
                validateArticleData(body);
            } catch (error) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: error.message
                    })
                };
            }
            const newArticle = {
                id: nextId.toString(),
                slug: createSlug(body.title || 'untitled'),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                views: 0,
                likes: 0,
                comments: 0,
                shares: 0,
                status: body.status || 'draft',
                ...body
            };
            newsStorage.push(newArticle);
            nextId++;
            return {
                statusCode: 201,
                headers,
                body: JSON.stringify({
                    success: true,
                    data: newArticle
                })
            };
        }

        // PUT /backoffice/news/{id} - Update news
        if (method === 'PUT' && path.startsWith('/backoffice/news/')) {
            const id = path.split('/').pop();
            try {
                validateId(id);
            } catch (error) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: error.message
                    })
                };
            }
            const body = JSON.parse(event.body || '{}');
            try {
                validateArticleData(body);
            } catch (error) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: error.message
                    })
                };
            }
            const index = newsStorage.findIndex(a => a.id === id);
            if (index === -1) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: 'Article not found'
                    })
                };
            }
            const updatedArticle = {
                ...newsStorage[index],
                ...body,
                slug: body.title ? createSlug(body.title) : newsStorage[index].slug,
                updatedAt: new Date().toISOString()
            };
            newsStorage[index] = updatedArticle;
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    data: updatedArticle
                })
            };
        }

        // DELETE /backoffice/news/{id} - Delete news
        if (method === 'DELETE' && path.startsWith('/backoffice/news/')) {
            const id = path.split('/').pop();
            try {
                validateId(id);
            } catch (error) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: error.message
                    })
                };
            }
            const index = newsStorage.findIndex(a => a.id === id);
            if (index === -1) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: 'Article not found'
                    })
                };
            }
            newsStorage.splice(index, 1);
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true
                })
            };
        }

        // GET /news/news/comment - Get comments
        if (method === 'GET' && path === '/news/news/comment') {
            const params = event.queryStringParameters || {};
            const newsId = params.news_id;
            // For demo, return empty comments array
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    data: []
                })
            };
        }

        // POST /news/news/comment - Post comment
        if (method === 'POST' && path === '/news/news/comment') {
            const body = JSON.parse(event.body || '{}');
            // For demo, just return success
            return {
                statusCode: 201,
                headers,
                body: JSON.stringify({
                    success: true,
                    data: {
                        id: Date.now().toString(),
                        ...body,
                        createdAt: new Date().toISOString()
                    }
                })
            };
        }

        // GET /epaper - Public epaper access
        if (method === 'GET' && path === '/epaper') {
            const params = event.queryStringParameters || {};
            const { edition, date } = params;

            let filtered = epaperStorage;

            if (edition) {
                filtered = filtered.filter(e => e.edition === edition);
            }

            if (date) {
                filtered = filtered.filter(e => e.date === date);
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    data: filtered
                })
            };
        }

        // GET /backoffice/epaper - Admin epaper access
        if (method === 'GET' && path === '/backoffice/epaper') {
            const params = event.queryStringParameters || {};
            const { edition, date } = params;

            let filtered = epaperStorage;

            if (edition) {
                filtered = filtered.filter(e => e.edition === edition);
            }

            if (date) {
                filtered = filtered.filter(e => e.date === date);
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    data: filtered
                })
            };
        }

        // POST /backoffice/epaper - Create epaper
        if (method === 'POST' && path === '/backoffice/epaper') {
            const body = JSON.parse(event.body || '{}');
            const newEpaper = {
                id: nextEpaperId.toString(),
                created_at: new Date().toISOString(),
                ...body
            };
            epaperStorage.push(newEpaper);
            nextEpaperId++;
            return {
                statusCode: 201,
                headers,
                body: JSON.stringify({
                    success: true,
                    data: newEpaper
                })
            };
        }

        // PUT /backoffice/epaper/{id} - Update epaper
        if (method === 'PUT' && path.startsWith('/backoffice/epaper/')) {
            const id = path.split('/').pop();
            const body = JSON.parse(event.body || '{}');
            const index = epaperStorage.findIndex(e => e.id === id);
            if (index === -1) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: 'Epaper not found'
                    })
                };
            }
            epaperStorage[index] = { ...epaperStorage[index], ...body };
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    data: epaperStorage[index]
                })
            };
        }

        // DELETE /backoffice/epaper/{id} - Delete epaper
        if (method === 'DELETE' && path.startsWith('/backoffice/epaper/')) {
            const id = path.split('/').pop();
            const index = epaperStorage.findIndex(e => e.id === id);
            if (index === -1) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: 'Epaper not found'
                    })
                };
            }
            epaperStorage.splice(index, 1);
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true
                })
            };
        }

        // Fallback for NewsAPI search (original functionality)
        if (method === 'GET' && path === '/newsapi/search') {
            const params = event.queryStringParameters || {};
            const { q, language = 'en', sortBy = 'publishedAt', pageSize = '50' } = params;

            if (!q) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Query parameter "q" is required' })
                };
            }

            const API_KEY = process.env.NEWS_API_KEY;
            if (!API_KEY) {
                console.error('NEWS_API_KEY not found');
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({ error: 'Server configuration error' })
                };
            }

            const apiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&language=${language}&sortBy=${sortBy}&pageSize=${pageSize}&apiKey=${API_KEY}`;
            const response = await fetch(apiUrl);
            if (!response.ok) {
                console.error('NewsAPI fetch failed:', response.status, response.statusText);
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({ error: 'Failed to fetch news data' })
                };
            }
            const data = await response.json();

            if (data.status === 'error') {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: data.message })
                };
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(data)
            };
        }

        // 404 for unknown routes
        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Endpoint not found'
            })
        };

    } catch (error) {
        console.error('Server Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Internal server error'
            })
        };
    }
};

// Helper function to create slug
function createSlug(title) {
    if (!title) return 'untitled';
    return title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 60)
        .trim();
}