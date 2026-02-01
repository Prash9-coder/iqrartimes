// src/components/article/CommentSection.jsx

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, ThumbsUp, Reply, Loader, Send, LogIn, User } from 'lucide-react';
import commentApi from '../../api/commentApi';
import { useAuth } from '../../context/AuthContext';

const CommentSection = ({ articleId }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    const [newComment, setNewComment] = useState('');
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // ✅ DEBUG: Log user object to see what fields are available
    useEffect(() => {
        if (user) {
            console.log('👤 ===== USER OBJECT DEBUG =====');
            console.log('Full user object:', user);
            console.log('user.name:', user.name);
            console.log('user.username:', user.username);
            console.log('user.email:', user.email);
            console.log('user.fullName:', user.fullName);
            console.log('user.full_name:', user.full_name);
            console.log('user.displayName:', user.displayName);
            console.log('user.first_name:', user.first_name);
            console.log('user.firstName:', user.firstName);
            console.log('================================');
        }
    }, [user]);

    // ✅ FIXED: Get proper display name from user object
    const getUserDisplayName = () => {
        if (!user) {
            console.log('❌ No user object');
            return 'User';
        }

        // Check all possible name fields in order of preference
        const possibleNames = [
            user.name,
            user.fullName,
            user.full_name,
            user.displayName,
            user.display_name,
            user.username,
            user.userName,
            user.firstName,
            user.first_name,
            user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : null,
        ];

        // Find first valid name
        for (const name of possibleNames) {
            if (name && typeof name === 'string' && name.trim()) {
                console.log('✅ Found name:', name);
                return name.trim();
            }
        }

        // Fallback to email prefix
        if (user.email && typeof user.email === 'string') {
            const emailName = user.email.split('@')[0];
            // Capitalize first letter
            const formattedName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
            console.log('📧 Using email name:', formattedName);
            return formattedName;
        }

        console.log('❌ No valid name found, using default');
        return 'User';
    };

    // ✅ Get avatar color based on name
    const getAvatarColor = (name) => {
        const colors = [
            'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
            'bg-indigo-500', 'bg-teal-500', 'bg-orange-500', 'bg-red-500',
            'bg-cyan-500', 'bg-emerald-500'
        ];
        let hash = 0;
        const nameToHash = name || 'User';
        for (let i = 0; i < nameToHash.length; i++) {
            hash = nameToHash.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    // ✅ Get initial letter
    const getInitial = (name) => {
        if (!name || name === 'User' || name === 'Anonymous') return 'U';
        return name.charAt(0).toUpperCase();
    };

    // ✅ Check if username looks like a random ID
    const isRandomId = (str) => {
        if (!str) return true;
        // Random IDs: short, only hex chars like "cc3be4"
        if (str.length <= 10 && /^[a-f0-9]+$/i.test(str)) {
            return true;
        }
        return false;
    };

    // ✅ Get display name for a comment from API
    const getCommentDisplayName = (comment) => {
        // Priority order for finding name
        const possibleNames = [
            comment.display_name,
            comment.displayName,
            comment.user_name,
            comment.userName,
            comment.author_name,
            comment.authorName,
            comment.author,
            comment.name,
            comment.user?.name,
            comment.user?.fullName,
            comment.user?.full_name,
            comment.user?.username,
            comment.user?.email?.split('@')[0],
            comment.created_by,
            comment.createdBy,
        ];

        for (const name of possibleNames) {
            if (name && typeof name === 'string' && name.trim() && !isRandomId(name)) {
                return name.trim();
            }
        }

        // Check username last (might be random ID)
        if (comment.username && !isRandomId(comment.username)) {
            return comment.username;
        }

        return 'Anonymous';
    };

    useEffect(() => {
        if (articleId) {
            fetchComments();
        }
    }, [articleId]);

    const fetchComments = async () => {
        setLoading(true);
        setError(null);

        try {
            console.log('📡 Fetching comments for article:', articleId);
            const result = await commentApi.getByNewsId(articleId);

            if (result.success) {
                console.log('✅ Comments loaded:', result.data.length);
                console.log('📦 Comments data:', result.data);
                setComments(Array.isArray(result.data) ? result.data : []);
            } else {
                setError(result.error);
            }
        } catch (err) {
            console.error('❌ Error fetching comments:', err);
            setError('Failed to load comments');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!newComment.trim() || !articleId) return;

        if (!isAuthenticated) {
            alert(t('comment.loginRequired', 'Please login to comment'));
            navigate('/login');
            return;
        }

        setSubmitting(true);
        const displayName = getUserDisplayName();

        console.log('📤 Posting comment as:', displayName);

        try {
            const result = await commentApi.create(articleId, newComment.trim());

            if (result.success) {
                console.log('✅ Comment posted successfully');

                // ✅ Add comment to local state with CORRECT user name
                const newCommentObj = {
                    id: result.data?.id || `temp-${Date.now()}`,
                    comment: newComment.trim(),
                    // ✅ Store multiple name fields for safety
                    username: displayName,
                    display_name: displayName,
                    user_name: displayName,
                    author: displayName,
                    profile_image: user?.avatar || user?.profile_image || user?.profileImage || null,
                    created_at: new Date().toISOString(),
                    likes: 0
                };

                console.log('📝 New comment object:', newCommentObj);

                setComments(prev => [newCommentObj, ...prev]);
                setNewComment('');
            } else {
                if (result.authRequired) {
                    navigate('/login');
                } else {
                    alert('❌ ' + (result.error || 'Failed to post comment'));
                }
            }
        } catch (err) {
            console.error('❌ Error posting comment:', err);
            alert('❌ Failed to post comment');
        } finally {
            setSubmitting(false);
        }
    };

    // ✅ Format relative time
    const formatDate = (dateStr) => {
        if (!dateStr) return 'Just now';

        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    if (!articleId) return null;

    const currentUserName = getUserDisplayName();

    return (
        <section className="mt-12 bg-white rounded-xl shadow-md p-6 md:p-8">
            {/* Header */}
            <h2 className="text-2xl md:text-3xl font-black mb-6 flex items-center gap-2">
                <MessageCircle className="text-primary" />
                {t('article.comments', 'Comments')}
                <span className="text-lg font-normal text-gray-500">({comments.length})</span>
            </h2>

            {/* Comment Form */}
            {isAuthenticated ? (
                <form onSubmit={handleSubmit} className="mb-8">
                    <div className="flex items-center gap-3 mb-3">
                        {/* ✅ User Avatar with proper color */}
                        <div className={`w-10 h-10 ${getAvatarColor(currentUserName)} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                            {getInitial(currentUserName)}
                        </div>
                        <div>
                            <p className="font-medium text-gray-800">
                                {currentUserName}
                            </p>
                            <p className="text-xs text-gray-500">Commenting as logged in user</p>
                        </div>
                    </div>

                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={t('comment.placeholder', 'Share your thoughts...')}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                        rows="4"
                        disabled={submitting}
                        maxLength={1000}
                    />

                    <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-gray-400">{newComment.length}/1000</span>

                        <motion.button
                            whileHover={{ scale: submitting ? 1 : 1.02 }}
                            whileTap={{ scale: submitting ? 1 : 0.98 }}
                            type="submit"
                            disabled={submitting || !newComment.trim()}
                            className="bg-primary text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <Loader className="animate-spin" size={18} />
                                    Posting...
                                </>
                            ) : (
                                <>
                                    <Send size={18} />
                                    {t('article.postComment', 'Post Comment')}
                                </>
                            )}
                        </motion.button>
                    </div>
                </form>
            ) : (
                <div className="mb-8 p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 text-center">
                    <LogIn size={32} className="mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600 mb-4">Please login to post a comment</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-primary text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-accent transition-colors inline-flex items-center gap-2"
                    >
                        <LogIn size={18} />
                        Login
                    </button>
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="text-center py-12">
                    <Loader className="animate-spin mx-auto text-primary" size={32} />
                    <p className="mt-3 text-gray-500">Loading comments...</p>
                </div>
            )}

            {/* Error */}
            {error && !loading && (
                <div className="text-center py-8 bg-red-50 rounded-lg">
                    <p className="text-red-500 mb-3">❌ {error}</p>
                    <button onClick={fetchComments} className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200">
                        Retry
                    </button>
                </div>
            )}

            {/* Comments List */}
            {!loading && !error && (
                <div className="space-y-6">
                    {comments.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <MessageCircle size={48} className="mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-500">No comments yet. Be the first to comment!</p>
                        </div>
                    ) : (
                        comments.map((comment, index) => {
                            // ✅ Get proper display name
                            const commentAuthor = getCommentDisplayName(comment);

                            return (
                                <motion.div
                                    key={comment.id || index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="border-b border-gray-100 pb-6 last:border-0 last:pb-0"
                                >
                                    <div className="flex items-start gap-4">
                                        {/* ✅ Avatar with color based on name */}
                                        <div className={`w-11 h-11 ${getAvatarColor(commentAuthor)} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-lg`}>
                                            {getInitial(commentAuthor)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                {/* ✅ Display proper name */}
                                                <h4 className="font-semibold text-gray-800">
                                                    {commentAuthor}
                                                </h4>
                                                <span className="text-xs text-gray-400 whitespace-nowrap">
                                                    {formatDate(comment.created_at)}
                                                </span>
                                            </div>

                                            {/* Comment text */}
                                            <p className="text-gray-700 leading-relaxed mb-3">
                                                {comment.comment}
                                            </p>

                                            {/* Actions */}
                                            <div className="flex items-center gap-4">
                                                <button className="flex items-center gap-1.5 text-gray-500 hover:text-primary transition-colors text-sm">
                                                    <ThumbsUp size={15} />
                                                    <span>{comment.likes || 0}</span>
                                                </button>
                                                <button className="flex items-center gap-1.5 text-gray-500 hover:text-primary transition-colors text-sm">
                                                    <Reply size={15} />
                                                    <span>Reply</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            )}
        </section>
    );
};

export default CommentSection;