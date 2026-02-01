// src/pages/admin/DashboardStats.jsx - FULLY FIXED VERSION

import React, { useState, useEffect, useCallback } from 'react';
import {
    Newspaper,
    Users,
    FileText,
    Clock,
    CheckCircle,
    RefreshCw,
    AlertCircle,
    Calendar,
    Award,
    BarChart3,
    TrendingUp,
    Edit3,
    Send,
    MessageSquare,
    Eye,
    UserCheck
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import dashboardApi from '../../api/dashboardApi';

// ✅ Helper: Get display name from reporter data
const getDisplayName = (reporter) => {
    if (reporter.name && reporter.name.trim()) {
        return reporter.name;
    }

    if (reporter.email) {
        const namePart = reporter.email.split('@')[0];
        let name = namePart
            .replace(/[0-9]/g, '')
            .replace(/[._-]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        if (name) {
            return name
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
        }
    }

    if (reporter.username) {
        if (!/^[a-f0-9]{6,}$/i.test(reporter.username)) {
            return reporter.username.charAt(0).toUpperCase() + reporter.username.slice(1);
        }
    }

    return 'Reporter';
};

// ✅ Helper: Get display email/username
const getDisplayEmail = (reporter) => {
    if (reporter.email) {
        return reporter.email;
    }
    if (reporter.username) {
        return `@${reporter.username}`;
    }
    return '';
};

const DashboardStats = () => {
    // ===== STATE =====
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    // ✅ FIXED: Updated default state to match API structure
    const [dashboardData, setDashboardData] = useState({
        articles: {
            today: 0,
            pending: 0,
            published: 0
        },
        totals: {
            news: 0,
            epapers: 0,
            comments: 0
        },
        users: {
            daily_unique_users: 0
        },
        news_by_category: [],
        top_reporters: []
    });

    // ===== FETCH DATA =====
    const fetchDashboardData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            console.log('📊 Fetching dashboard data...');

            const result = await dashboardApi.getStats();

            if (result.success && result.data) {
                console.log('✅ Dashboard data received:', result.data);
                
                // ✅ Log specific values for debugging
                console.log('📈 Stats:', {
                    totalNews: result.data.totals?.news,
                    totalEpapers: result.data.totals?.epapers,
                    totalComments: result.data.totals?.comments,
                    dailyUsers: result.data.users?.daily_unique_users,
                    todayArticles: result.data.articles?.today,
                    pendingArticles: result.data.articles?.pending,
                    publishedArticles: result.data.articles?.published
                });
                
                setDashboardData(result.data);
                setLastUpdated(new Date());
            } else {
                console.log('⚠️ No data from API');
                setError('Failed to load dashboard data');
            }
        } catch (err) {
            console.error('❌ Dashboard fetch error:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // ===== EFFECTS =====
    useEffect(() => {
        fetchDashboardData();

        const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [fetchDashboardData]);

    // ===== HELPER FUNCTIONS =====
    const formatNumber = (num) => {
        if (num === null || num === undefined) return '0';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    // ===== ✅ FIXED STAT CARDS - Correct data mapping =====
    const statCards = [
        {
            title: 'Total News',
            value: dashboardData.totals?.news || 0,
            icon: Newspaper,
            gradient: 'from-blue-500 to-blue-600',
            description: 'All published articles'
        },
        {
            title: 'Total E-Papers',
            value: dashboardData.totals?.epapers || 0,
            icon: FileText,
            gradient: 'from-pink-500 to-pink-600',
            description: 'Digital editions'
        },
        {
            title: 'Daily Users',  // ✅ FIXED: Changed title
            value: dashboardData.users?.daily_unique_users || 0,  // ✅ FIXED: Correct path
            icon: Eye,
            gradient: 'from-cyan-500 to-cyan-600',
            description: 'Unique visitors today'
        },
        {
            title: 'Total Comments',  // ✅ ADDED: Comments card
            value: dashboardData.totals?.comments || 0,
            icon: MessageSquare,
            gradient: 'from-orange-500 to-orange-600',
            description: 'User engagement'
        },
        {
            title: 'Published Today',  // ✅ FIXED: Today's articles
            value: dashboardData.articles?.today || 0,
            icon: CheckCircle,
            gradient: 'from-green-500 to-green-600',
            description: 'Articles today'
        },
        {
            title: 'Pending Approval',
            value: dashboardData.articles?.pending || 0,
            icon: Clock,
            gradient: 'from-yellow-500 to-yellow-600',
            urgent: (dashboardData.articles?.pending || 0) > 0,
            description: 'Needs review'
        },
    ];

    // ===== CATEGORY COLORS =====
    const categoryColors = [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
        '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
    ];

    const categoryData = (dashboardData.news_by_category || []).map((cat, index) => ({
        name: cat.category_name,
        value: cat.news_count,
        color: categoryColors[index % categoryColors.length]
    }));

    // ✅ Calculate total articles from categories
    const totalCategoryArticles = categoryData.reduce((sum, cat) => sum + cat.value, 0);

    // ===== LOADING STATE =====
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    // ===== RENDER =====
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <BarChart3 className="text-blue-600" size={28} />
                        Dashboard Overview
                    </h1>
                    {lastUpdated && (
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                            <Clock size={14} />
                            Last updated: {lastUpdated.toLocaleTimeString()}
                        </p>
                    )}
                </div>
                <button
                    onClick={fetchDashboardData}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                    <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                    <button
                        onClick={fetchDashboardData}
                        className="ml-auto text-sm underline hover:no-underline"
                    >
                        Try again
                    </button>
                </div>
            )}

            {/* ✅ Stats Grid - Updated to 6 cards in 2 rows */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={index}
                            className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-4 relative overflow-hidden ${
                                stat.urgent ? 'ring-2 ring-yellow-400' : ''
                            }`}
                        >
                            {/* Background Icon */}
                            <div className="absolute -right-2 -bottom-2 opacity-5">
                                <Icon size={60} />
                            </div>

                            <div className="relative">
                                <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg mb-2`}>
                                    <Icon className="text-white" size={20} />
                                </div>
                                <p className="text-xs text-gray-500 font-medium">{stat.title}</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">
                                    {formatNumber(stat.value)}
                                </p>
                                {stat.description && (
                                    <p className="text-xs text-gray-400 mt-1">{stat.description}</p>
                                )}
                                {stat.urgent && (
                                    <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1 font-medium">
                                        <AlertCircle size={10} />
                                        Needs attention
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ✅ Article Stats Summary - NEW SECTION */}
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl p-6 text-white">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <TrendingUp size={20} />
                    Today's Performance
                </h2>
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white/20 backdrop-blur rounded-lg p-4 text-center">
                        <p className="text-3xl font-bold">{dashboardData.articles?.today || 0}</p>
                        <p className="text-sm opacity-90">Published Today</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-lg p-4 text-center">
                        <p className="text-3xl font-bold">{dashboardData.articles?.published || 0}</p>
                        <p className="text-sm opacity-90">Total Published</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-lg p-4 text-center">
                        <p className="text-3xl font-bold">{dashboardData.users?.daily_unique_users || 0}</p>
                        <p className="text-sm opacity-90">Daily Visitors</p>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Newspaper size={20} className="text-blue-600" />
                        News by Category
                        <span className="ml-auto text-sm font-normal text-gray-500">
                            Total: {totalCategoryArticles}
                        </span>
                    </h2>

                    {categoryData.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => 
                                            percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''
                                        }
                                        outerRadius={90}
                                        innerRadius={50}
                                        dataKey="value"
                                        paddingAngle={2}
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value, name) => [`${value} articles`, name]}
                                        contentStyle={{
                                            borderRadius: '8px',
                                            border: 'none',
                                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>

                            {/* Category Legend */}
                            <div className="flex flex-wrap gap-2 mt-4 justify-center">
                                {categoryData.map((cat, index) => (
                                    <div 
                                        key={index} 
                                        className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
                                    >
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: cat.color }}
                                        />
                                        <span className="text-sm text-gray-700 font-medium">{cat.name}</span>
                                        <span className="text-xs text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded">
                                            {cat.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="h-[280px] flex items-center justify-center text-gray-400">
                            <div className="text-center">
                                <Newspaper size={48} className="mx-auto mb-2 opacity-50" />
                                <p>No category data available</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Top Reporters */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-5 border-b bg-gradient-to-r from-purple-500 to-indigo-600">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Award size={20} />
                            Top Reporters
                        </h2>
                        <p className="text-purple-100 text-sm mt-1">Based on articles published</p>
                    </div>

                    <div className="divide-y max-h-[400px] overflow-y-auto">
                        {(dashboardData.top_reporters || []).length > 0 ? (
                            dashboardData.top_reporters.map((reporter, index) => {
                                const displayName = getDisplayName(reporter);
                                const displayEmail = getDisplayEmail(reporter);

                                // Medal colors for top 3
                                const medalColors = {
                                    0: 'from-yellow-400 to-orange-500',
                                    1: 'from-gray-300 to-gray-500',
                                    2: 'from-amber-600 to-amber-700'
                                };

                                return (
                                    <div 
                                        key={reporter.user_id || index} 
                                        className="p-4 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {/* Rank Badge */}
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow ${
                                                    index < 3 
                                                        ? `bg-gradient-to-br ${medalColors[index]}` 
                                                        : 'bg-gray-400'
                                                }`}>
                                                    {index + 1}
                                                </div>

                                                {/* Profile Image */}
                                                {reporter.profile_image ? (
                                                    <img
                                                        src={reporter.profile_image}
                                                        alt={displayName}
                                                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow">
                                                        {displayName.charAt(0).toUpperCase()}
                                                    </div>
                                                )}

                                                <div>
                                                    <h3 className="font-semibold text-gray-800">
                                                        {displayName}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 truncate max-w-[150px]">
                                                        {displayEmail}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-xl font-bold text-blue-600">
                                                    {reporter.articles_count}
                                                </p>
                                                <p className="text-xs text-gray-500">articles</p>
                                            </div>
                                        </div>

                                        {/* Progress bar for visual comparison */}
                                        {dashboardData.top_reporters[0]?.articles_count > 0 && (
                                            <div className="mt-2 ml-11">
                                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full rounded-full ${
                                                            index === 0 ? 'bg-yellow-400' :
                                                            index === 1 ? 'bg-gray-400' :
                                                            index === 2 ? 'bg-amber-600' :
                                                            'bg-blue-400'
                                                        }`}
                                                        style={{ 
                                                            width: `${(reporter.articles_count / dashboardData.top_reporters[0].articles_count) * 100}%` 
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-8 text-center text-gray-400">
                                <Users size={48} className="mx-auto mb-2 opacity-50" />
                                <p>No reporter data available</p>
                            </div>
                        )}
                    </div>

                    {/* Total reporters summary */}
                    {(dashboardData.top_reporters || []).length > 0 && (
                        <div className="p-3 bg-gray-50 border-t text-center">
                            <p className="text-sm text-gray-600">
                                <span className="font-semibold">
                                    {dashboardData.top_reporters.reduce((sum, r) => sum + r.articles_count, 0)}
                                </span> total articles by {dashboardData.top_reporters.length} reporters
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Send size={20} className="text-green-600" />
                    Quick Actions
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <a
                        href="/admin/news"
                        className="flex flex-col items-center gap-3 p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all group"
                    >
                        <div className="p-3 bg-blue-500 rounded-xl group-hover:scale-110 transition-transform">
                            <Newspaper className="text-white" size={24} />
                        </div>
                        <span className="font-medium text-gray-800">Manage News</span>
                    </a>
                    <a
                        href="/admin/epaper"
                        className="flex flex-col items-center gap-3 p-5 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl hover:from-pink-100 hover:to-pink-200 transition-all group"
                    >
                        <div className="p-3 bg-pink-500 rounded-xl group-hover:scale-110 transition-transform">
                            <FileText className="text-white" size={24} />
                        </div>
                        <span className="font-medium text-gray-800">Manage E-Paper</span>
                    </a>
                    <a
                        href="/admin/categories"
                        className="flex flex-col items-center gap-3 p-5 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition-all group"
                    >
                        <div className="p-3 bg-green-500 rounded-xl group-hover:scale-110 transition-transform">
                            <Edit3 className="text-white" size={24} />
                        </div>
                        <span className="font-medium text-gray-800">Categories</span>
                    </a>
                    <a
                        href="/admin/users"
                        className="flex flex-col items-center gap-3 p-5 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all group"
                    >
                        <div className="p-3 bg-purple-500 rounded-xl group-hover:scale-110 transition-transform">
                            <Users className="text-white" size={24} />
                        </div>
                        <span className="font-medium text-gray-800">Manage Users</span>
                    </a>
                </div>
            </div>

            {/* Pending Alert */}
            {(dashboardData.articles?.pending || 0) > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-400 rounded-full animate-pulse">
                            <Clock className="text-yellow-900" size={20} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-yellow-800">
                                {dashboardData.articles.pending} Article{dashboardData.articles.pending > 1 ? 's' : ''} Pending Approval
                            </h3>
                            <p className="text-sm text-yellow-600">Review and approve pending articles</p>
                        </div>
                    </div>
                    <a
                        href="/admin/news?status=pending"
                        className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
                    >
                        Review Now
                    </a>
                </div>
            )}

            {/* Footer */}
            <div className="text-center text-sm text-gray-400 py-4">
                <Calendar size={14} className="inline mr-1" />
                Dashboard auto-refreshes every 5 minutes
            </div>
        </div>
    );
};

export default DashboardStats;