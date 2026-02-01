import React, { useState, useEffect } from 'react';
import {
    Plus,
    Edit2,
    Trash2,
    UserCheck,
    UserX,
    Mail,
    Phone,
    Shield,
    Search,
    Filter,
    Download,
    Upload,
    Eye,
    Lock,
    X,
    Save,
    Camera,
    Award,
    Calendar,
    Activity
} from 'lucide-react';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        role: 'all',
        status: 'all',
        department: 'all'
    });

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'reporter',
        password: '',
        confirmPassword: '',
        department: '',
        bio: '',
        avatar: null,
        status: 'active',
        permissions: [],
        address: '',
        city: '',
        joinDate: '',
        salary: '',
        employeeId: ''
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(10);
    const [avatarPreview, setAvatarPreview] = useState(null);

    const roles = [
        { value: 'admin', label: 'Admin', color: 'red', description: 'Full system access' },
        { value: 'editor', label: 'Editor', color: 'purple', description: 'Can edit and publish' },
        { value: 'reporter', label: 'Reporter', color: 'blue', description: 'Can create articles' },
        { value: 'contributor', label: 'Contributor', color: 'green', description: 'Limited access' }
    ];

    const departments = [
        'Politics',
        'Sports',
        'Entertainment',
        'Business',
        'Technology',
        'Health',
        'Education',
        'Crime',
        'Local News'
    ];

    const allPermissions = [
        { id: 'create_news', label: 'Create News', category: 'News' },
        { id: 'edit_news', label: 'Edit News', category: 'News' },
        { id: 'delete_news', label: 'Delete News', category: 'News' },
        { id: 'publish_news', label: 'Publish News', category: 'News' },
        { id: 'approve_news', label: 'Approve News', category: 'News' },
        { id: 'manage_categories', label: 'Manage Categories', category: 'Content' },
        { id: 'manage_users', label: 'Manage Users', category: 'Admin' },
        { id: 'manage_epaper', label: 'Manage E-Paper', category: 'Content' },
        { id: 'moderate_comments', label: 'Moderate Comments', category: 'Content' },
        { id: 'view_analytics', label: 'View Analytics', category: 'Analytics' },
        { id: 'manage_media', label: 'Manage Media', category: 'Content' },
        { id: 'manage_settings', label: 'Manage Settings', category: 'Admin' }
    ];

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        // API call
        // const response = await getUsers();
        // setUsers(response.data);

        // Mock data with more details
        setUsers([
            {
                id: 1,
                name: 'Rajesh Kumar',
                email: 'rajesh@iqarnews.com',
                phone: '+91 9876543210',
                role: 'editor',
                department: 'Politics',
                status: 'active',
                avatar: null,
                bio: 'Senior political correspondent with 10 years experience',
                articleCount: 234,
                joinDate: '2020-01-15',
                lastActive: '2024-12-20T10:30:00',
                employeeId: 'EMP001',
                city: 'Karimnagar',
                permissions: ['create_news', 'edit_news', 'publish_news']
            },
            {
                id: 2,
                name: 'Priya Sharma',
                email: 'priya@iqarnews.com',
                phone: '+91 9876543211',
                role: 'reporter',
                department: 'Sports',
                status: 'active',
                avatar: null,
                bio: 'Sports journalist covering cricket and local sports',
                articleCount: 156,
                joinDate: '2021-03-20',
                lastActive: '2024-12-20T09:15:00',
                employeeId: 'EMP002',
                city: 'Warangal',
                permissions: ['create_news', 'edit_news']
            },
            {
                id: 3,
                name: 'Amit Patel',
                email: 'amit@iqarnews.com',
                phone: '+91 9876543212',
                role: 'reporter',
                department: 'Business',
                status: 'inactive',
                avatar: null,
                bio: 'Business news reporter',
                articleCount: 89,
                joinDate: '2022-06-10',
                lastActive: '2024-12-15T14:20:00',
                employeeId: 'EMP003',
                city: 'Hyderabad',
                permissions: ['create_news']
            },
            {
                id: 4,
                name: 'Admin User',
                email: 'admin@iqarnews.com',
                phone: '+91 9876543213',
                role: 'admin',
                department: 'Administration',
                status: 'active',
                avatar: null,
                bio: 'System Administrator',
                articleCount: 0,
                joinDate: '2019-01-01',
                lastActive: '2024-12-20T11:00:00',
                employeeId: 'EMP000',
                city: 'Karimnagar',
                permissions: allPermissions.map(p => p.id)
            }
        ]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!editingId && formData.password !== formData.confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        if (!editingId && formData.password.length < 6) {
            alert('Password must be at least 6 characters!');
            return;
        }

        const dataToSubmit = { ...formData };
        delete dataToSubmit.confirmPassword;

        if (editingId) {
            // await updateUser(editingId, dataToSubmit);
            if (import.meta.env.DEV) console.log('Updating user:', editingId, dataToSubmit);
        } else {
            // await createUser(dataToSubmit);
            if (import.meta.env.DEV) console.log('Creating user:', dataToSubmit);
        }

        setIsModalOpen(false);
        resetForm();
        fetchUsers();
    };

    const handleDelete = async (id) => {
        const user = users.find(u => u.id === id);
        if (user.role === 'admin') {
            alert('Cannot delete admin user!');
            return;
        }

        if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
            // await deleteUser(id);
            if (import.meta.env.DEV) console.log('Deleting user:', id);
            fetchUsers();
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        // await updateUserStatus(id, newStatus);
        setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u));
    };

    const handleEdit = (user) => {
        setFormData({
            ...user,
            password: '',
            confirmPassword: ''
        });
        setEditingId(user.id);
        setAvatarPreview(user.avatar);
        setIsModalOpen(true);
    };

    const handleView = (user) => {
        setSelectedUser(user);
        setIsViewModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            phone: '',
            role: 'reporter',
            password: '',
            confirmPassword: '',
            department: '',
            bio: '',
            avatar: null,
            status: 'active',
            permissions: [],
            address: '',
            city: '',
            joinDate: '',
            salary: '',
            employeeId: ''
        });
        setEditingId(null);
        setAvatarPreview(null);
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, avatar: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePermissionToggle = (permissionId) => {
        const newPermissions = formData.permissions.includes(permissionId)
            ? formData.permissions.filter(p => p !== permissionId)
            : [...formData.permissions, permissionId];
        setFormData({ ...formData, permissions: newPermissions });
    };

    const getRoleBadgeColor = (role) => {
        const roleObj = roles.find(r => r.value === role);
        const colors = {
            red: 'bg-red-100 text-red-800',
            purple: 'bg-purple-100 text-purple-800',
            blue: 'bg-blue-100 text-blue-800',
            green: 'bg-green-100 text-green-800'
        };
        return colors[roleObj?.color] || colors.blue;
    };

    const exportUsers = () => {
        // Export users to CSV
        const csv = [
            ['Name', 'Email', 'Phone', 'Role', 'Department', 'Status', 'Articles', 'Join Date'],
            ...filteredUsers.map(u => [
                u.name,
                u.email,
                u.phone,
                u.role,
                u.department,
                u.status,
                u.articleCount,
                u.joinDate
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'users.csv';
        a.click();
    };

    // Filtering
    const filteredUsers = users.filter(user => {
        let matches = true;

        if (filters.search) {
            const search = filters.search.toLowerCase();
            matches = matches && (
                user.name.toLowerCase().includes(search) ||
                user.email.toLowerCase().includes(search) ||
                user.phone.includes(search) ||
                user.employeeId.toLowerCase().includes(search)
            );
        }

        if (filters.role !== 'all') {
            matches = matches && user.role === filters.role;
        }

        if (filters.status !== 'all') {
            matches = matches && user.status === filters.status;
        }

        if (filters.department !== 'all') {
            matches = matches && user.department === filters.department;
        }

        return matches;
    });

    // Pagination
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">User Management</h1>
                    <p className="text-gray-600 mt-1">Manage reporters, editors, and administrators</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={exportUsers}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                        <Download size={18} /> Export
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Plus size={20} /> Add User
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Total Users</p>
                            <p className="text-2xl font-bold">{users.length}</p>
                        </div>
                        <Users className="text-blue-500" size={32} />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Active Users</p>
                            <p className="text-2xl font-bold text-green-600">
                                {users.filter(u => u.status === 'active').length}
                            </p>
                        </div>
                        <UserCheck className="text-green-500" size={32} />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Reporters</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {users.filter(u => u.role === 'reporter').length}
                            </p>
                        </div>
                        <Award className="text-blue-500" size={32} />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Editors</p>
                            <p className="text-2xl font-bold text-purple-600">
                                {users.filter(u => u.role === 'editor').length}
                            </p>
                        </div>
                        <Shield className="text-purple-500" size={32} />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <select
                        value={filters.role}
                        onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                        className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Roles</option>
                        {roles.map(role => (
                            <option key={role.value} value={role.value}>{role.label}</option>
                        ))}
                    </select>

                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>

                    <select
                        value={filters.department}
                        onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                        className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Departments</option>
                        {departments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Articles</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Active</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <img
                                                src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                                                alt={user.name}
                                                className="w-10 h-10 rounded-full mr-3"
                                            />
                                            <div>
                                                <div className="font-medium">{user.name}</div>
                                                <div className="text-sm text-gray-500">{user.employeeId}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Mail size={14} className="text-gray-400" />
                                                {user.email}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Phone size={14} className="text-gray-400" />
                                                {user.phone}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                                            <Shield size={12} className="inline mr-1" />
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm">{user.department}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => toggleStatus(user.id, user.status)}
                                            disabled={user.role === 'admin'}
                                            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${user.status === 'active'
                                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                } ${user.role === 'admin' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                                        >
                                            {user.status === 'active' ? <UserCheck size={14} /> : <UserX size={14} />}
                                            {user.status}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className="font-semibold text-blue-600">{user.articleCount}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(user.lastActive).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleView(user)}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(user)}
                                                className="text-green-600 hover:text-green-900"
                                                title="Edit"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                disabled={user.role === 'admin'}
                                                className={`text-red-600 hover:text-red-900 ${user.role === 'admin' ? 'opacity-50 cursor-not-allowed' : ''
                                                    }`}
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <div className="flex gap-1">
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`px-3 py-2 rounded-lg ${currentPage === i + 1
                                        ? 'bg-blue-600 text-white'
                                        : 'border hover:bg-gray-100'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-lg p-6 w-full max-w-4xl my-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">
                                {editingId ? 'Edit User' : 'Add New User'}
                            </h2>
                            <button onClick={() => { setIsModalOpen(false); resetForm(); }}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Avatar Upload */}
                                <div className="md:col-span-3 flex justify-center">
                                    <div className="relative">
                                        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                                            {avatarPreview ? (
                                                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <Camera size={48} className="text-gray-400" />
                                            )}
                                        </div>
                                        <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700">
                                            <Camera size={18} />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleAvatarChange}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                </div>

                                {/* Personal Information */}
                                <div className="md:col-span-3">
                                    <h3 className="font-semibold text-lg mb-4 border-b pb-2">Personal Information</h3>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Full Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Email *</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Phone *</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Employee ID *</label>
                                    <input
                                        type="text"
                                        value={formData.employeeId}
                                        onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">City</label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Join Date</label>
                                    <input
                                        type="date"
                                        value={formData.joinDate}
                                        onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="md:col-span-3">
                                    <label className="block text-sm font-medium mb-2">Address</label>
                                    <textarea
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows="2"
                                    />
                                </div>

                                {/* Professional Information */}
                                <div className="md:col-span-3">
                                    <h3 className="font-semibold text-lg mb-4 border-b pb-2">Professional Information</h3>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Role *</label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        {roles.map(role => (
                                            <option key={role.value} value={role.value}>
                                                {role.label} - {role.description}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Department *</label>
                                    <select
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>

                                <div className="md:col-span-3">
                                    <label className="block text-sm font-medium mb-2">Bio</label>
                                    <textarea
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows="3"
                                        placeholder="Brief description about the user..."
                                    />
                                </div>

                                {/* Security */}
                                {!editingId && (
                                    <>
                                        <div className="md:col-span-3">
                                            <h3 className="font-semibold text-lg mb-4 border-b pb-2">Security</h3>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Password *</label>
                                            <input
                                                type="password"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required={!editingId}
                                                minLength={6}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Confirm Password *</label>
                                            <input
                                                type="password"
                                                value={formData.confirmPassword}
                                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required={!editingId}
                                                minLength={6}
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Permissions */}
                                <div className="md:col-span-3">
                                    <h3 className="font-semibold text-lg mb-4 border-b pb-2">Permissions</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {Object.entries(
                                            allPermissions.reduce((acc, perm) => {
                                                if (!acc[perm.category]) acc[perm.category] = [];
                                                acc[perm.category].push(perm);
                                                return acc;
                                            }, {})
                                        ).map(([category, perms]) => (
                                            <div key={category} className="border rounded-lg p-3">
                                                <h4 className="font-medium text-sm mb-2 text-gray-700">{category}</h4>
                                                {perms.map(permission => (
                                                    <label key={permission.id} className="flex items-center gap-2 mb-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.permissions.includes(permission.id)}
                                                            onChange={() => handlePermissionToggle(permission.id)}
                                                            className="w-4 h-4 text-blue-600"
                                                        />
                                                        <span className="text-sm">{permission.label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                                <button
                                    type="button"
                                    onClick={() => { setIsModalOpen(false); resetForm(); }}
                                    className="px-6 py-2 border rounded-lg hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                                >
                                    <Save size={18} />
                                    {editingId ? 'Update User' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View User Modal */}
            {isViewModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">User Details</h2>
                            <button onClick={() => setIsViewModalOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Profile Header */}
                            <div className="flex items-center gap-4 pb-6 border-b">
                                <img
                                    src={selectedUser.avatar || `https://ui-avatars.com/api/?name=${selectedUser.name}&background=random&size=128`}
                                    alt={selectedUser.name}
                                    className="w-24 h-24 rounded-full"
                                />
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold">{selectedUser.name}</h3>
                                    <p className="text-gray-600">{selectedUser.email}</p>
                                    <div className="flex gap-2 mt-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(selectedUser.role)}`}>
                                            {selectedUser.role}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${selectedUser.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {selectedUser.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Employee ID</p>
                                    <p className="font-medium">{selectedUser.employeeId}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Phone</p>
                                    <p className="font-medium">{selectedUser.phone}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Department</p>
                                    <p className="font-medium">{selectedUser.department}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">City</p>
                                    <p className="font-medium">{selectedUser.city}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Join Date</p>
                                    <p className="font-medium">{new Date(selectedUser.joinDate).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Last Active</p>
                                    <p className="font-medium">{new Date(selectedUser.lastActive).toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Bio */}
                            {selectedUser.bio && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Bio</p>
                                    <p className="text-gray-800">{selectedUser.bio}</p>
                                </div>
                            )}

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <p className="text-3xl font-bold text-blue-600">{selectedUser.articleCount}</p>
                                    <p className="text-sm text-gray-600">Articles</p>
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <p className="text-3xl font-bold text-green-600">{selectedUser.permissions.length}</p>
                                    <p className="text-sm text-gray-600">Permissions</p>
                                </div>
                                <div className="text-center p-4 bg-purple-50 rounded-lg">
                                    <p className="text-3xl font-bold text-purple-600">
                                        {Math.floor((new Date() - new Date(selectedUser.joinDate)) / (1000 * 60 * 60 * 24))}
                                    </p>
                                    <p className="text-sm text-gray-600">Days Active</p>
                                </div>
                            </div>

                            {/* Permissions */}
                            <div className="pt-4 border-t">
                                <p className="text-sm text-gray-600 mb-2">Permissions</p>
                                <div className="flex flex-wrap gap-2">
                                    {selectedUser.permissions.map(perm => {
                                        const permission = allPermissions.find(p => p.id === perm);
                                        return (
                                            <span key={perm} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                                {permission?.label || perm}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-2 pt-4 border-t">
                                <button
                                    onClick={() => {
                                        setIsViewModalOpen(false);
                                        handleEdit(selectedUser);
                                    }}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                                >
                                    <Edit2 size={18} /> Edit User
                                </button>
                                <button
                                    onClick={() => setIsViewModalOpen(false)}
                                    className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;