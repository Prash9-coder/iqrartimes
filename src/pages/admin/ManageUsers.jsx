// src/pages/admin/ManageUsers.jsx
import React, { useState, useEffect } from 'react';
import {
    Search,
    Edit2,
    UserCheck,
    UserX,
    Mail,
    Phone,
    Shield,
    RefreshCw,
    X,
    Filter,
    Users,
    AlertCircle
} from 'lucide-react';
import userApi from '../../api/userApi';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Search & Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    // Edit Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [selectedRole, setSelectedRole] = useState('');
    const [updating, setUpdating] = useState(false);

    // Available roles
    const roles = [
        { value: 'ADMIN', label: 'Admin', icon: '👑' },
        { value: 'REPORTER', label: 'Reporter', icon: '📝' },
        { value: 'ENDUSER', label: 'End User', icon: '👤' }
    ];

    useEffect(() => {
        fetchUsers();
    }, []);

    // Extract display name from email or phone
    const getDisplayName = (user) => {
        if (!user) return 'User';

        // First check if name exists
        if (user.name && typeof user.name === 'string' && user.name.trim() && user.name !== 'N/A') {
            return user.name;
        }
        if (user.full_name && typeof user.full_name === 'string' && user.full_name.trim() && user.full_name !== 'N/A') {
            return user.full_name;
        }

        // Extract from email
        if (user.email && typeof user.email === 'string') {
            const emailName = user.email.split('@')[0];
            const formattedName = emailName
                .replace(/[._]/g, ' ')
                .replace(/\d+/g, '')
                .split(' ')
                .filter(word => word.length > 0)
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ')
                .trim();

            if (formattedName) return formattedName;
        }

        // Convert phone to string first before using slice
        const phone = user.phone || user.mobile;
        if (phone) {
            const phoneStr = String(phone);
            return `User ${phoneStr.slice(-4)}`;
        }

        return 'User';
    };

    // Get initials for avatar
    const getInitials = (user) => {
        if (!user) return 'U';

        const name = getDisplayName(user);
        if (!name || typeof name !== 'string') return 'U';

        const words = name.split(' ').filter(w => w.length > 0);
        if (words.length >= 2) {
            return (words[0][0] + words[1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    // Get phone display with proper type checking
    const getPhoneDisplay = (user) => {
        const phone = user?.phone || user?.mobile;
        if (!phone) return null;
        return String(phone);
    };

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);

        try {
            console.log('📡 Fetching all users...');
            const response = await userApi.getAll();

            if (response.success) {
                console.log('✅ Users fetched:', response.data.length);
                setUsers(Array.isArray(response.data) ? response.data : []);
            } else {
                throw new Error(response.error);
            }
        } catch (err) {
            console.error('❌ Error fetching users:', err);
            setError(err.message || 'Failed to fetch users');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e?.preventDefault();

        if (!searchQuery.trim()) {
            fetchUsers();
            return;
        }

        setIsSearching(true);
        setError(null);

        try {
            console.log('🔍 Searching for:', searchQuery);
            const response = await userApi.search(searchQuery);

            if (response.success) {
                setUsers(Array.isArray(response.data) ? response.data : []);
            } else {
                throw new Error(response.error);
            }
        } catch (err) {
            console.error('❌ Search error:', err);
            setError(err.message);
        } finally {
            setIsSearching(false);
        }
    };

    const handleRoleFilter = async (role) => {
        setRoleFilter(role);
        setLoading(true);
        setError(null);

        try {
            if (!role) {
                await fetchUsers();
                return;
            }

            console.log('🔍 Filtering by role:', role);
            const response = await userApi.getByRole(role);

            if (response.success) {
                setUsers(Array.isArray(response.data) ? response.data : []);
            } else {
                throw new Error(response.error);
            }
        } catch (err) {
            console.error('❌ Filter error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        const currentRole = Array.isArray(user.user_role)
            ? user.user_role[0]
            : user.user_role || user.role || 'ENDUSER';
        setSelectedRole(String(currentRole).toUpperCase());
        setIsModalOpen(true);
    };

    const handleUpdateRole = async () => {
        if (!editingUser || !selectedRole) return;

        setUpdating(true);

        try {
            console.log('📡 Updating role for:', editingUser.id, 'to:', selectedRole);
            const response = await userApi.updateRole(editingUser.id, selectedRole);

            if (response.success) {
                console.log('✅ Role updated successfully');

                setUsers(prev => prev.map(user =>
                    user.id === editingUser.id
                        ? { ...user, user_role: [selectedRole] }
                        : user
                ));

                setIsModalOpen(false);
                setEditingUser(null);
                alert('✅ User role updated successfully!');
            } else {
                throw new Error(response.error);
            }
        } catch (err) {
            console.error('❌ Update error:', err);
            alert('❌ Failed to update: ' + err.message);
        } finally {
            setUpdating(false);
        }
    };

    const getRoleBadge = (role) => {
        const roleStr = Array.isArray(role) ? role[0] : role;
        const upperRole = String(roleStr || 'ENDUSER').toUpperCase();

        const roleConfig = {
            'ADMIN': { bg: 'bg-red-100', text: 'text-red-800', icon: '👑' },
            'REPORTER': { bg: 'bg-blue-100', text: 'text-blue-800', icon: '📝' },
            'ENDUSER': { bg: 'bg-green-100', text: 'text-green-800', icon: '👤' }
        };

        return roleConfig[upperRole] || roleConfig['ENDUSER'];
    };

    const clearFilters = () => {
        setSearchQuery('');
        setRoleFilter('');
        fetchUsers();
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="text-primary" />
                        Manage Users
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Total: {users.length} users
                    </p>
                </div>

                <button
                    onClick={fetchUsers}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Search & Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <form onSubmit={handleSearch} className="flex-1">
                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by phone or email..."
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => { setSearchQuery(''); fetchUsers(); }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </form>

                    {/* Role Filter */}
                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-gray-400" />
                        <select
                            value={roleFilter}
                            onChange={(e) => handleRoleFilter(e.target.value)}
                            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                            <option value="">All Roles</option>
                            {roles.map(role => (
                                <option key={role.value} value={role.value}>
                                    {role.icon} {role.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Search Button */}
                    <button
                        onClick={handleSearch}
                        disabled={isSearching}
                        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                    >
                        {isSearching ? (
                            <RefreshCw size={18} className="animate-spin" />
                        ) : (
                            <Search size={18} />
                        )}
                        Search
                    </button>
                </div>

                {/* Active Filters */}
                {(searchQuery || roleFilter) && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                        <span className="text-sm text-gray-500">Active filters:</span>
                        {searchQuery && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                Search: {searchQuery}
                            </span>
                        )}
                        {roleFilter && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                                Role: {roleFilter}
                            </span>
                        )}
                        <button
                            onClick={clearFilters}
                            className="text-xs text-red-600 hover:underline"
                        >
                            Clear all
                        </button>
                    </div>
                )}
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
                    <AlertCircle className="text-red-500" />
                    <div>
                        <p className="font-medium text-red-800">Error</p>
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                    <button
                        onClick={fetchUsers}
                        className="ml-auto px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Loading State */}
            {loading ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <RefreshCw size={40} className="animate-spin text-primary mx-auto mb-4" />
                    <p className="text-gray-500">Loading users...</p>
                </div>
            ) : users.length === 0 ? (
                /* Empty State */
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <Users size={48} className="text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Users Found</h3>
                    <p className="text-gray-500">
                        {searchQuery || roleFilter
                            ? 'Try adjusting your search or filters'
                            : 'No users in the system yet'
                        }
                    </p>
                </div>
            ) : (
                /* Users Table */
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((user) => {
                                    const roleBadge = getRoleBadge(user.user_role || user.role);
                                    const displayName = getDisplayName(user);
                                    const phoneDisplay = getPhoneDisplay(user);

                                    return (
                                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                            {/* User Column - Name Only, No ID */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <img
                                                        src={user.avatar || user.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(getInitials(user))}&background=random&color=fff&bold=true`}
                                                        alt={displayName}
                                                        className="w-10 h-10 rounded-full mr-3 object-cover"
                                                        onError={(e) => {
                                                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(getInitials(user))}&background=random&color=fff&bold=true`;
                                                        }}
                                                    />
                                                    <div className="font-medium text-gray-900">
                                                        {displayName}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Contact Column */}
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    {user.email && (
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <Mail size={14} className="text-gray-400" />
                                                            {user.email}
                                                        </div>
                                                    )}
                                                    {phoneDisplay && (
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <Phone size={14} className="text-gray-400" />
                                                            {phoneDisplay}
                                                        </div>
                                                    )}
                                                    {!user.email && !phoneDisplay && (
                                                        <span className="text-sm text-gray-400 italic">No contact info</span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Role Column */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${roleBadge.bg} ${roleBadge.text}`}>
                                                    <span>{roleBadge.icon}</span>
                                                    {Array.isArray(user.user_role)
                                                        ? user.user_role[0]
                                                        : (user.user_role || user.role || 'ENDUSER')}
                                                </span>
                                            </td>

                                            {/* Status Column */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${user.is_active !== false
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {user.is_active !== false ? (
                                                        <>
                                                            <UserCheck size={12} />
                                                            Active
                                                        </>
                                                    ) : (
                                                        <>
                                                            <UserX size={12} />
                                                            Inactive
                                                        </>
                                                    )}
                                                </span>
                                            </td>

                                            {/* Actions Column */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleEdit(user)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                                >
                                                    <Edit2 size={14} />
                                                    Edit Role
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Edit Role Modal */}
            {isModalOpen && editingUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <Shield className="text-primary" />
                                Edit User Role
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            {/* User Info */}
                            <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-lg">
                                <img
                                    src={editingUser.avatar || editingUser.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(getInitials(editingUser))}&background=random&color=fff&bold=true`}
                                    alt={getDisplayName(editingUser)}
                                    className="w-12 h-12 rounded-full object-cover"
                                    onError={(e) => {
                                        e.target.src = `https://ui-avatars.com/api/?name=U&background=random&color=fff&bold=true`;
                                    }}
                                />
                                <div>
                                    <p className="font-semibold">
                                        {getDisplayName(editingUser)}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {editingUser.email || getPhoneDisplay(editingUser) || 'No contact info'}
                                    </p>
                                </div>
                            </div>

                            {/* Role Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Select Role
                                </label>
                                <div className="space-y-2">
                                    {roles.map(role => (
                                        <label
                                            key={role.value}
                                            className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${selectedRole === role.value
                                                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="role"
                                                value={role.value}
                                                checked={selectedRole === role.value}
                                                onChange={(e) => setSelectedRole(e.target.value)}
                                                className="w-4 h-4 text-primary"
                                            />
                                            <span className="text-xl">{role.icon}</span>
                                            <div>
                                                <p className="font-medium">{role.label}</p>
                                                <p className="text-xs text-gray-500">
                                                    {role.value === 'ADMIN' && 'Full access to all features'}
                                                    {role.value === 'REPORTER' && 'Can create and manage news'}
                                                    {role.value === 'ENDUSER' && 'Regular user access'}
                                                </p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end gap-3 p-4 border-t bg-gray-50 rounded-b-xl">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                disabled={updating}
                                className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateRole}
                                disabled={updating}
                                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                {updating ? (
                                    <>
                                        <RefreshCw size={16} className="animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <UserCheck size={16} />
                                        Update Role
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageUsers;