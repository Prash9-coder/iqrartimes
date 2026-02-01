// src/components/admin/AdminHeader.jsx
import React, { useState } from 'react';
import { Menu, Bell, User, LogOut, Search, Shield, X, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminHeader = ({ toggleSidebar }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [showSearch, setShowSearch] = useState(false);

    const notifications = [
        { id: 1, text: 'New article submitted for approval', time: '5 min ago', unread: true },
        { id: 2, text: 'Comment reported on article "Breaking News"', time: '1 hour ago', unread: true },
        { id: 3, text: 'New user registered', time: '2 hours ago', unread: false },
    ];

    const handleLogout = async () => {
        if (window.confirm('Are you sure you want to logout?')) {
            try {
                await logout();
            } catch (error) {
                console.error("❌ Logout error:", error);
            }
        }
    };

    const displayName = user?.name ||
        user?.email?.split('@')[0] ||
        (user?.username && !/^[a-f0-9]{6,}$/i.test(user?.username) ? user.username : null) ||
        'Admin User';

    const displayEmail = user?.email || 'admin@iqrartimes.com';
    const userRole = user?.role || 'admin';

    const avatarUrl = user?.avatar ||
        user?.profile_image ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=dc2626&color=fff`;

    return (
        <>
            {/* 📱 Mobile-First Header */}
            <header className="bg-white dark:bg-gray-800 shadow-md z-50 sticky top-0">
                <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
                    {/* Left Section */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        <button
                            onClick={toggleSidebar}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors touch-manipulation active:scale-95"
                            aria-label="Toggle Menu"
                        >
                            <Menu size={24} className="text-gray-700 dark:text-gray-300" />
                        </button>

                        {/* Logo/Title - Hidden on very small screens */}
                        <h1 className="hidden xs:block text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
                            Admin
                        </h1>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-1 sm:gap-3">
                        {/* Search Button - Mobile */}
                        <button
                            onClick={() => setShowSearch(true)}
                            className="sm:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors touch-manipulation active:scale-95"
                            aria-label="Search"
                        >
                            <Search size={20} className="text-gray-700 dark:text-gray-300" />
                        </button>

                        {/* Desktop Search */}
                        <div className="hidden sm:block relative">
                            <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                size={18}
                            />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white w-48 lg:w-64"
                            />
                        </div>

                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowNotifications(!showNotifications);
                                    setShowProfile(false);
                                }}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg relative transition-colors touch-manipulation active:scale-95"
                                aria-label="Notifications"
                            >
                                <Bell size={20} className="text-gray-700 dark:text-gray-300" />
                                {notifications.some(n => n.unread) && (
                                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
                                )}
                            </button>
                        </div>

                        {/* Profile */}
                        <button
                            onClick={() => {
                                setShowProfile(!showProfile);
                                setShowNotifications(false);
                            }}
                            className="flex items-center gap-2 p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors touch-manipulation active:scale-95"
                        >
                            <img
                                src={avatarUrl}
                                alt={displayName}
                                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full ring-2 ring-red-500"
                            />
                            <div className="hidden lg:block text-left">
                                <p className="font-medium text-gray-900 dark:text-white text-sm">
                                    {displayName}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    {userRole === 'admin' && <Shield size={10} />}
                                    <span className="capitalize">{userRole}</span>
                                </p>
                            </div>
                        </button>
                    </div>
                </div>
            </header>

            {/* 📱 Full-Screen Mobile Search Overlay */}
            {showSearch && (
                <div className="sm:hidden fixed inset-0 bg-white dark:bg-gray-800 z-50 animate-slideInRight">
                    <div className="flex items-center gap-3 p-4 border-b dark:border-gray-700">
                        <button
                            onClick={() => setShowSearch(false)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                            <X size={24} className="text-gray-700 dark:text-gray-300" />
                        </button>
                        <input
                            type="text"
                            placeholder="Search..."
                            autoFocus
                            className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-base"
                        />
                    </div>
                </div>
            )}

            {/* 📱 Mobile-Optimized Notifications Dropdown */}
            {showNotifications && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-black/20 sm:bg-transparent"
                        onClick={() => setShowNotifications(false)}
                    />
                    <div className="fixed sm:absolute left-0 right-0 sm:left-auto sm:right-4 top-[60px] sm:top-[70px] bottom-0 sm:bottom-auto sm:w-80 sm:max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 sm:rounded-lg shadow-2xl border-t sm:border border-gray-200 dark:border-gray-700 z-50 flex flex-col animate-slideInUp sm:animate-slideInDown overflow-hidden">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                            <button
                                onClick={() => setShowNotifications(false)}
                                className="sm:hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    className={`p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer active:bg-gray-100 transition-colors ${notif.unread ? 'bg-red-50 dark:bg-red-900/20' : ''
                                        }`}
                                >
                                    <p className="text-sm text-gray-900 dark:text-white">{notif.text}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notif.time}</p>
                                </div>
                            ))}
                        </div>
                        <div className="p-3 text-center border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                            <button className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium">
                                View all notifications
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* 📱 Mobile-Optimized Profile Dropdown */}
            {showProfile && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-black/20 sm:bg-transparent"
                        onClick={() => setShowProfile(false)}
                    />
                    <div className="fixed sm:absolute left-0 right-0 sm:left-auto sm:right-4 bottom-0 sm:bottom-auto sm:top-[70px] sm:w-72 sm:max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-lg shadow-2xl border-t sm:border border-gray-200 dark:border-gray-700 z-50 animate-slideInUp sm:animate-slideInDown overflow-hidden">
                        {/* User Info */}
                        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                            {/* Drag Handle - Mobile Only */}
                            <div className="sm:hidden w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4"></div>

                            <div className="flex items-center gap-3 mb-4">
                                <img
                                    src={avatarUrl}
                                    alt={displayName}
                                    className="w-14 h-14 rounded-full ring-2 ring-red-500"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 dark:text-white truncate text-base">
                                        {displayName}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                        {displayEmail}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm">
                                {userRole === 'admin' && <Shield size={14} className="text-red-600 dark:text-red-400" />}
                                <span className="text-red-600 dark:text-red-400 font-medium capitalize">
                                    {userRole}
                                </span>
                            </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                            <button
                                onClick={() => {
                                    setShowProfile(false);
                                    navigate('/');
                                }}
                                className="w-full px-5 py-3.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 text-gray-700 dark:text-gray-300 active:bg-gray-100 transition-colors touch-manipulation"
                            >
                                <Home size={20} />
                                <span className="text-base">View Website</span>
                            </button>
                        </div>

                        {/* Logout */}
                        <div className="border-t border-gray-200 dark:border-gray-700 py-2 pb-safe">
                            <button
                                onClick={handleLogout}
                                className="w-full px-5 py-3.5 text-left hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 text-red-600 dark:text-red-400 font-medium active:bg-red-100 transition-colors touch-manipulation"
                            >
                                <LogOut size={20} />
                                <span className="text-base">Logout</span>
                            </button>
                        </div>
                    </div>
                </>
            )}

            <style>{`
                @keyframes slideInUp {
                    from {
                        transform: translateY(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }

                @keyframes slideInDown {
                    from {
                        transform: translateY(-10px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }

                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                    }
                    to {
                        transform: translateX(0);
                    }
                }

                .animate-slideInUp {
                    animation: slideInUp 0.3s ease-out;
                }

                .animate-slideInDown {
                    animation: slideInDown 0.2s ease-out;
                }

                .animate-slideInRight {
                    animation: slideInRight 0.3s ease-out;
                }

                .pb-safe {
                    padding-bottom: env(safe-area-inset-bottom);
                }
            `}</style>
        </>
    );
};

export default AdminHeader;