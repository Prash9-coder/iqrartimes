import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Camera, X, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import RightSidebar from '../components/layout/RightSidebar';

const Photos = () => {
    const { t } = useTranslation();
    const [selectedGallery, setSelectedGallery] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const photoGalleries = [
        {
            id: 1,
            title: "Parliament Session: Education Reform Bill Passed",
            thumbnail: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=600&fit=crop",
            count: 25,
            category: "India",
            time: "2 hours ago",
            images: [
                "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1200&h=800&fit=crop",
                "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1200&h=800&fit=crop",
                "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&h=800&fit=crop",
                "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&h=800&fit=crop",
            ]
        },
        {
            id: 2,
            title: "World Cup Final 2024: India's Historic Victory",
            thumbnail: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&h=600&fit=crop",
            count: 50,
            category: "Sports",
            time: "3 hours ago",
            images: [
                "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1200&h=800&fit=crop",
                "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1200&h=800&fit=crop",
                "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=1200&h=800&fit=crop",
                "https://images.unsplash.com/photo-1593766788306-28561086694e?w=1200&h=800&fit=crop",
            ]
        },
        {
            id: 3,
            title: "COP29 Climate Summit: World Leaders Unite",
            thumbnail: "https://images.unsplash.com/photo-1569163139394-de4798aa62b2?w=800&h=600&fit=crop",
            count: 35,
            category: "World",
            time: "5 hours ago",
            images: [
                "https://images.unsplash.com/photo-1569163139394-de4798aa62b2?w=1200&h=800&fit=crop",
                "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1200&h=800&fit=crop",
                "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=1200&h=800&fit=crop",
                "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&h=800&fit=crop",
            ]
        },
        {
            id: 4,
            title: "Bollywood 100 Years: Grand Celebration",
            thumbnail: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&h=600&fit=crop",
            count: 75,
            category: "Entertainment",
            time: "6 hours ago",
            images: [
                "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&h=800&fit=crop",
                "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&h=800&fit=crop",
                "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=1200&h=800&fit=crop",
                "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=1200&h=800&fit=crop",
            ]
        },
        {
            id: 5,
            title: "Stock Market Rally: Sensex at Record High",
            thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop",
            count: 20,
            category: "Business",
            time: "8 hours ago",
            images: [
                "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=800&fit=crop",
                "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&h=800&fit=crop",
                "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=800&fit=crop",
                "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1200&h=800&fit=crop",
            ]
        },
        {
            id: 6,
            title: "MediAI Launch Event: AI Healthcare Revolution",
            thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop",
            count: 30,
            category: "Technology",
            time: "10 hours ago",
            images: [
                "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=800&fit=crop",
                "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=800&fit=crop",
                "https://images.unsplash.com/photo-1551076805-e1869033e561?w=1200&h=800&fit=crop",
                "https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=1200&h=800&fit=crop",
            ]
        },
    ];

    const openGallery = (gallery) => {
        setSelectedGallery(gallery);
        setCurrentImageIndex(0);
    };

    const closeGallery = () => {
        setSelectedGallery(null);
    };

    const nextImage = () => {
        if (selectedGallery) {
            setCurrentImageIndex((prev) => (prev + 1) % selectedGallery.images.length);
        }
    };

    const prevImage = () => {
        if (selectedGallery) {
            setCurrentImageIndex((prev) => (prev - 1 + selectedGallery.images.length) % selectedGallery.images.length);
        }
    };

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
                                <Camera className="text-primary mr-3" size={32} />
                                Photo Galleries
                            </h1>
                            <p className="text-gray-600">Browse through our exclusive photo collections</p>
                        </motion.div>

                        {/* Photo Galleries Grid */}
                        <div className="grid md:grid-cols-2 gap-4">
                            {photoGalleries.map((gallery, index) => (
                                <motion.div
                                    key={gallery.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    onClick={() => openGallery(gallery)}
                                    className="bg-white rounded-lg shadow-md overflow-hidden group cursor-pointer hover:shadow-xl transition-shadow"
                                >
                                    <div className="relative h-56">
                                        <img
                                            src={gallery.thumbnail}
                                            alt={gallery.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                        <div className="absolute bottom-4 left-4 right-4 text-white">
                                            <span className="bg-primary px-2 py-1 rounded text-xs font-bold uppercase">
                                                {gallery.category}
                                            </span>
                                            <h3 className="font-bold text-lg mt-2 line-clamp-2">{gallery.title}</h3>
                                        </div>
                                        <div className="absolute top-4 right-4 bg-black/80 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                                            <Camera size={14} className="mr-1" />
                                            {gallery.count} Photos
                                        </div>
                                    </div>
                                    <div className="p-4 flex items-center justify-between">
                                        <div className="flex items-center text-gray-500 text-sm">
                                            <Clock size={14} className="mr-1" />
                                            {gallery.time}
                                        </div>
                                        <span className="text-primary font-semibold text-sm">View Gallery →</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-[150px]">
                            <RightSidebar />
                        </div>
                    </div>
                </div>
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {selectedGallery && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center"
                        onClick={closeGallery}
                    >
                        <button
                            className="absolute top-4 right-4 text-white hover:text-primary transition-colors z-10"
                            onClick={closeGallery}
                        >
                            <X size={32} />
                        </button>

                        <button
                            className="absolute left-4 text-white hover:text-primary transition-colors z-10"
                            onClick={(e) => {
                                e.stopPropagation();
                                prevImage();
                            }}
                        >
                            <ChevronLeft size={48} />
                        </button>

                        <motion.div
                            key={currentImageIndex}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="max-w-5xl max-h-[85vh] p-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={selectedGallery.images[currentImageIndex]}
                                alt={selectedGallery.title}
                                className="max-w-full max-h-[75vh] object-contain rounded-lg"
                            />
                            <div className="text-white text-center mt-4">
                                <h3 className="text-xl font-bold">{selectedGallery.title}</h3>
                                <p className="text-white/70 mt-2">
                                    {currentImageIndex + 1} / {selectedGallery.images.length}
                                </p>
                            </div>
                        </motion.div>

                        <button
                            className="absolute right-4 text-white hover:text-primary transition-colors z-10"
                            onClick={(e) => {
                                e.stopPropagation();
                                nextImage();
                            }}
                        >
                            <ChevronRight size={48} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Photos;