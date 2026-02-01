import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MessageSquare, User, Clock, ArrowRight } from 'lucide-react';
import RightSidebar from '../components/layout/RightSidebar';

const Opinion = () => {
    const opinions = [
        {
            id: 1,
            title: "Education Reform: A Step in the Right Direction",
            excerpt: "The new education bill addresses long-standing issues in our education system. Here's why it matters for India's future.",
            author: {
                name: "Dr. Ananya Sharma",
                avatar: "https://i.pravatar.cc/150?img=1",
                designation: "Education Policy Expert"
            },
            image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop",
            time: "2 hours ago",
            category: "Editorial"
        },
        {
            id: 2,
            title: "The Climate Agreement: Promises and Challenges Ahead",
            excerpt: "While the COP29 agreement is historic, the real test lies in implementation. Nations must walk the talk.",
            author: {
                name: "Rajiv Menon",
                avatar: "https://i.pravatar.cc/150?img=3",
                designation: "Environmental Analyst"
            },
            image: "https://images.unsplash.com/photo-1569163139394-de4798aa62b2?w=800&h=400&fit=crop",
            time: "5 hours ago",
            category: "Analysis"
        },
        {
            id: 3,
            title: "India's Stock Market Rally: Sustainable or Speculative?",
            excerpt: "The Sensex at 75,000 raises questions about market valuations. Here's what investors should consider.",
            author: {
                name: "Priya Khanna",
                avatar: "https://i.pravatar.cc/150?img=5",
                designation: "Financial Analyst"
            },
            image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop",
            time: "8 hours ago",
            category: "Opinion"
        },
        {
            id: 4,
            title: "AI in Healthcare: Opportunities and Ethical Concerns",
            excerpt: "As AI platforms like MediAI transform healthcare, we must address privacy and accuracy concerns.",
            author: {
                name: "Dr. Vikram Patel",
                avatar: "https://i.pravatar.cc/150?img=8",
                designation: "Healthcare Policy Advisor"
            },
            image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop",
            time: "12 hours ago",
            category: "Column"
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 mt-[30px]">
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6"
                        >
                            <h1 className="text-3xl md:text-4xl font-black uppercase flex items-center">
                                <MessageSquare className="text-primary mr-3" size={32} />
                                Opinion & Editorials
                            </h1>
                            <p className="text-gray-600">Expert analysis, columns, and editorial perspectives</p>
                        </motion.div>

                        {/* Opinion Articles */}
                        <div className="space-y-6">
                            {opinions.map((opinion, index) => (
                                <motion.article
                                    key={opinion.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                                >
                                    <div className="md:flex">
                                        <div className="md:w-1/3">
                                            <img
                                                src={opinion.image}
                                                alt={opinion.title}
                                                className="w-full h-full object-cover min-h-[200px]"
                                            />
                                        </div>
                                        <div className="md:w-2/3 p-6">
                                            <span className="text-primary text-xs font-bold uppercase bg-primary/10 px-3 py-1 rounded-full">
                                                {opinion.category}
                                            </span>
                                            <h2 className="text-xl font-black mt-3 mb-3 hover:text-primary transition-colors cursor-pointer">
                                                {opinion.title}
                                            </h2>
                                            <p className="text-gray-600 mb-4 line-clamp-2">{opinion.excerpt}</p>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <img
                                                        src={opinion.author.avatar}
                                                        alt={opinion.author.name}
                                                        className="w-12 h-12 rounded-full"
                                                    />
                                                    <div>
                                                        <h4 className="font-bold text-sm">{opinion.author.name}</h4>
                                                        <p className="text-gray-500 text-xs">{opinion.author.designation}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center text-gray-500 text-sm">
                                                    <Clock size={14} className="mr-1" />
                                                    {opinion.time}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.article>
                            ))}
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-36">
                            <RightSidebar />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Opinion;