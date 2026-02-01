// src/components/admin/AdminSidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    FolderTree,
    Newspaper,
    FileText,
    Users,
    CheckSquare,
    Shield,
    Info,
    X,
} from 'lucide-react';

const AdminSidebar = ({ isOpen, setIsOpen }) => {
    const location = useLocation();
    const { user, isAdmin } = useAuth();

    const menuItems = [
        {
            path: '/admin',
            icon: LayoutDashboard,
            label: 'Dashboard',
            allowedRoles: ['admin'],
        },
        {
            path: '/admin/categories',
            icon: FolderTree,
            label: 'Categories',
            allowedRoles: ['admin', 'reporter'],
        },
        {
            path: '/admin/news',
            icon: Newspaper,
            label: 'News Articles',
            allowedRoles: ['admin', 'reporter'],
        },
        {
            path: '/admin/news/approval',
            icon: CheckSquare,
            label: 'Approval Queue',
            allowedRoles: ['admin'],
        },
        {
            path: '/admin/epaper',
            icon: FileText,
            label: 'E-Paper',
            allowedRoles: ['admin'],
        },
        {
            path: '/admin/users',
            icon: Users,
            label: 'Users/Reporters',
            allowedRoles: ['admin'],
        },
    ];

    const visibleMenuItems = menuItems.filter((item) => {
        if (!item.allowedRoles) return true;
        return item.allowedRoles.includes(user?.role);
    });

    const handleLinkClick = () => {
        // Close sidebar on mobile after click
        if (window.innerWidth < 1024) {
            setIsOpen(false);
        }
    };

    return (
        <>
            {/* 📱 Mobile Overlay */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40 animate-fadeIn"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* 📱 Sidebar - Mobile Drawer / Desktop Fixed */}
            <aside
                className={`
                    fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
                    ${isOpen ? 'w-72 sm:w-80' : 'w-0 lg:w-20'}
                    bg-gray-900 text-white transition-all duration-300 ease-in-out
                    flex flex-col
                    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    shadow-2xl lg:shadow-none
                `}
            >
                {/* Header */}
                <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                    <div className={`${!isOpen && 'lg:hidden'} flex items-center gap-3`}>
                        <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center font-bold text-lg">
                            IQ
                        </div>
                        <div>
                            <h2 className="font-bold text-base">Admin Panel</h2>
                            <p className="text-xs text-gray-400">Iqrar Times</p>
                        </div>
                    </div>

                    {/* Close Button - Mobile Only */}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="lg:hidden p-2 hover:bg-gray-800 rounded-lg touch-manipulation active:scale-95"
                    >
                        <X size={24} />
                    </button>

                    {/* Collapsed Logo */}
                    {!isOpen && (
                        <div className="hidden lg:flex justify-center w-full">
                            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center font-bold text-lg">
                                IQ
                            </div>
                        </div>
                    )}
                </div>

                {/* User Role Badge */}
                {isOpen && (
                    <div className="p-4 border-b border-gray-800">
                        <div className="flex items-center gap-3 px-3 py-2.5 bg-gray-800 rounded-lg">
                            <Shield size={18} className="text-red-400" />
                            <div>
                                <p className="text-xs text-gray-400">Logged in as</p>
                                <p className="text-sm font-semibold text-white capitalize">
                                    {user?.role || 'User'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <nav className="mt-2 flex-1 overflow-y-auto">
                    {visibleMenuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={handleLinkClick}
                                className={`
                                    flex items-center gap-3 px-4 py-3.5 
                                    hover:bg-gray-800 transition-all
                                    touch-manipulation active:bg-gray-700
                                    ${isActive ? 'bg-gray-800 border-l-4 border-red-500 text-white' : 'text-gray-300'}
                                    ${!isOpen && 'lg:justify-center lg:px-0'}
                                `}
                                title={!isOpen ? item.label : undefined}
                            >
                                <Icon size={22} className={isActive ? 'text-red-500' : ''} />
                                <span className={`font-medium ${!isOpen && 'lg:hidden'}`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Reporter Info */}
                {isOpen && !isAdmin && (
                    <div className="p-4 border-t border-gray-800">
                        <div className="flex items-start gap-2 px-3 py-2.5 bg-blue-900/30 rounded-lg">
                            <Info size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-blue-300 leading-relaxed">
                                Some features are restricted to admin users only.
                            </p>
                        </div>
                    </div>
                )}

                {/* Safe Area - iOS */}
                <div className="pb-safe" />
            </aside>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }

                .pb-safe {
                    padding-bottom: env(safe-area-inset-bottom);
                }
            `}</style>
        </>
    );
};

export default AdminSidebar;