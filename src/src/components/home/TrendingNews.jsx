// src/components/home/TrendingNews.jsx

import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import { TrendingUp, Eye, Clock } from 'lucide-react'
import { fetchNewsData, getTrendingArticles } from '../../data/newsData'
import { parseAndFormatTime, formatDateEnglish } from '../../utils/dateUtils' // ✅ Import
import Loader from '../common/Loader'

const TrendingNews = () => {
    const { t } = useTranslation()
    const [trending, setTrending] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                await fetchNewsData()
                const fetchedTrending = getTrendingArticles()
                setTrending(fetchedTrending)
                setLoading(false)
            } catch (err) {
                console.error('Error fetching news data:', err)
                setError(err.message)
                setLoading(false)
            }
        }
        
        fetchData()
    }, [])

    // ✅ Format time in English
    const getFormattedDate = (article) => {
        const dateValue = article.time || article.date || article.publishedAt || article.createdAt;
        if (!dateValue) return '';
        return article.timeOnly || parseAndFormatTime(dateValue);
    }

    if (loading) {
        return <Loader />
    }

    if (error) {
        return <div className="text-center py-8 text-red-500">Error: {error}</div>
    }

    return (
        <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-6 mt-[100px]"
        >
            <div className="flex items-center space-x-2 mb-6">
                <TrendingUp className="text-primary" size={24} />
                <h2 className="text-2xl font-black uppercase">{t('home.trending')}</h2>
            </div>

            <div className="space-y-4">
                {trending.map((article, index) => (
                    <Link key={article.id} to={`/article/${article.slug}`}>
                        <motion.article
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ x: 5 }}
                            className="flex space-x-4 group cursor-pointer pb-4 border-b border-gray-100 last:border-0"
                        >
                            <div className="relative">
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl ${index === 0
                                        ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white'
                                        : index === 1
                                            ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white'
                                            : index === 2
                                                ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white'
                                                : 'bg-gradient-to-br from-primary to-accent text-white'
                                        }`}
                                >
                                    {index + 1}
                                </motion.div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-sm mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                    {article.title}
                                </h3>
                                <div className="flex items-center gap-3 text-gray-500 text-xs">
                                    <span className="flex items-center">
                                        <Eye size={14} className="mr-1" />
                                        {article.views?.toLocaleString() || '0'} {t('article.views')}
                                    </span>
                                    {/* ✅ FIXED: English date */}
                                    {getFormattedDate(article) && (
                                        <span className="flex items-center">
                                            <Clock size={14} className="mr-1" />
                                            {getFormattedDate(article)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                <motion.img
                                    whileHover={{ scale: 1.2 }}
                                    src={article.image}
                                    alt={article.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.src = '/IqrarNews.jpeg'; }}
                                />
                            </div>
                        </motion.article>
                    </Link>
                ))}
            </div>

            <Link to="/trending">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full mt-6 bg-gradient-to-r from-primary to-accent text-white font-bold py-3 rounded-lg hover:shadow-lg transition-shadow"
                >
                    {t('home.viewAll')} Trending
                </motion.button>
            </Link>
        </motion.section>
    )
}

export default TrendingNews