import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

const ImageGallery = ({ images }) => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const openLightbox = (index) => {
        setCurrentIndex(index);
        setSelectedImage(images[index]);
    };

    const closeLightbox = () => {
        setSelectedImage(null);
    };

    const nextImage = () => {
        const newIndex = (currentIndex + 1) % images.length;
        setCurrentIndex(newIndex);
        setSelectedImage(images[newIndex]);
    };

    const prevImage = () => {
        const newIndex = (currentIndex - 1 + images.length) % images.length;
        setCurrentIndex(newIndex);
        setSelectedImage(images[newIndex]);
    };

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-8">
                {images.map((image, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative group cursor-pointer overflow-hidden rounded-lg"
                        onClick={() => openLightbox(index)}
                    >
                        <img
                            src={image.url}
                            alt={image.caption}
                            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                            <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={32} />
                        </div>
                        {image.caption && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                                <p className="text-white text-sm font-medium line-clamp-2">{image.caption}</p>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4"
                        onClick={closeLightbox}
                    >
                        {/* Close Button */}
                        <button
                            className="absolute top-4 right-4 text-white hover:text-primary transition-colors"
                            onClick={closeLightbox}
                        >
                            <X size={32} />
                        </button>

                        {/* Previous Button */}
                        {images.length > 1 && (
                            <button
                                className="absolute left-4 text-white hover:text-primary transition-colors"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    prevImage();
                                }}
                            >
                                <ChevronLeft size={48} />
                            </button>
                        )}

                        {/* Image */}
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className="max-w-5xl max-h-[90vh]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={selectedImage.url}
                                alt={selectedImage.caption}
                                className="max-w-full max-h-[80vh] object-contain rounded-lg"
                            />
                            {selectedImage.caption && (
                                <p className="text-white text-center mt-4 text-lg">
                                    {selectedImage.caption}
                                </p>
                            )}
                            <p className="text-white/60 text-center mt-2">
                                {currentIndex + 1} / {images.length}
                            </p>
                        </motion.div>

                        {/* Next Button */}
                        {images.length > 1 && (
                            <button
                                className="absolute right-4 text-white hover:text-primary transition-colors"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    nextImage();
                                }}
                            >
                                <ChevronRight size={48} />
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ImageGallery;