import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import config from '../config';

export default function AddProductModal({ isOpen, onClose }) {
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category: 'Tops',
        tag: 'Streetwear',
        description: '',
        brand: '',
        size: '',
        condition: 'good',
        rentPricePerDay: '',
        retailPrice: '',
        securityDeposit: '',
    });
    const [imageFiles, setImageFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const { CLOUD_NAME, UPLOAD_PRESET } = config.CLOUDINARY;

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + imageFiles.length > 5) {
            alert('Maximum 5 images allowed');
            return;
        }

        const newFiles = [...imageFiles, ...files];
        setImageFiles(newFiles);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews([...previews, ...newPreviews]);
    };

    const removeImage = (index) => {
        const newFiles = imageFiles.filter((_, i) => i !== index);
        const newPreviews = previews.filter((_, i) => i !== index);
        setImageFiles(newFiles);
        setPreviews(newPreviews);
    };

    const uploadImages = async () => {
        if (imageFiles.length === 0) return [];

        const uploadPromises = imageFiles.map(async (file) => {
            const data = new FormData();
            data.append('file', file);
            data.append('upload_preset', UPLOAD_PRESET);

            try {
                const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                    method: 'POST',
                    body: data
                });
                const result = await res.json();
                return {
                    url: result.secure_url,
                    publicId: result.public_id,
                    isPrimary: false
                };
            } catch (err) {
                console.error('Cloudinary upload error:', err);
                return null;
            }
        });

        const uploadedImages = await Promise.all(uploadPromises);
        const filtered = uploadedImages.filter(img => img !== null);
        if (filtered.length > 0) filtered[0].isPrimary = true;
        return filtered;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        try {
            // 1. Upload images to Cloudinary
            const uploadedImages = await uploadImages();

            if (imageFiles.length > 0 && uploadedImages.length === 0) {
                alert("Image upload failed. Please check your Cloudinary settings.");
                setLoading(false);
                return;
            }

            // 2. Submit product data
            const res = await fetch(`${config.API_URL}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    owner: user.username || 'Anonymous',
                    userId: user._id,
                    price: Number(formData.price),
                    rentPricePerDay: Number(formData.rentPricePerDay) || Number(formData.price) * 10,
                    retailPrice: Number(formData.retailPrice),
                    securityDeposit: Number(formData.securityDeposit),
                    bgClass: 'bg-gray-800',
                    image: uploadedImages.length > 0 ? uploadedImages[0].url : '',
                    images: uploadedImages
                })
            });

            if (res.ok) {
                alert("Product submitted for approval! It will be visible after admin review.");
                onClose();
                setFormData({
                    name: '', price: '', category: 'Tops', tag: 'Streetwear',
                    description: '', brand: '', size: '', condition: 'good',
                    rentPricePerDay: '', retailPrice: '', securityDeposit: ''
                });
                setImageFiles([]);
                setPreviews([]);
                window.location.reload();
            } else {
                const error = await res.json();
                if (error.verificationStatus && error.verificationStatus !== 'verified') {
                    alert(`Aadhaar verification required! Current status: ${error.verificationStatus}. Please verify your Aadhaar first.`);
                } else if (error.sellerStatus) {
                    alert(`Seller approval required. Current status: ${error.sellerStatus}`);
                } else {
                    alert(error.message || "Failed to add product");
                }
            }
        } catch (err) {
            console.error(err);
            alert("Error submitting product");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="bg-[#08080a] w-full max-w-5xl rounded-2xl border border-white/10 p-8 shadow-2xl relative my-8"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="mb-8">
                            <h2 className="text-4xl font-black italic uppercase text-white tracking-tighter">List Your <span className="text-orange-600">Grails.</span></h2>
                            <p className="text-gray-500 text-sm mt-2 font-mono uppercase tracking-widest">Sector: Inventory / New Listing</p>
                        </div>

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* Left Column: Media */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Media Assets (Max 5)</label>

                                    <div className="grid grid-cols-3 gap-3 mb-4">
                                        {previews.map((src, i) => (
                                            <div key={i} className="aspect-square relative rounded-lg overflow-hidden border border-white/10 group">
                                                <img src={src} className="w-full h-full object-cover" alt="Preview" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(i)}
                                                    className="absolute inset-0 bg-red-600/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <span className="text-white font-black text-xs uppercase">Remove</span>
                                                </button>
                                            </div>
                                        ))}
                                        {previews.length < 5 && (
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current.click()}
                                                className="aspect-square border-2 border-dashed border-white/5 hover:border-orange-600/50 hover:bg-white/[0.02] flex flex-col items-center justify-center rounded-lg transition-all group"
                                            >
                                                <span className="text-2xl mb-1 group-hover:scale-125 transition-transform">➕</span>
                                                <span className="text-[8px] font-black text-gray-600 uppercase group-hover:text-gray-400">Add Photo</span>
                                            </button>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        multiple
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <p className="text-[9px] text-gray-600 font-mono italic">High resolution JPG/PNG preferred. First image will be the primary cover.</p>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Description</label>
                                    <textarea
                                        required
                                        className="w-full bg-[#111114] border border-white/5 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-orange-600/50 transition-all bg-transparent resize-none h-48 text-sm leading-relaxed"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Describe the vibe, condition, fit details, or any flaws..."
                                    />
                                </div>
                            </div>

                            {/* Right Column: Details */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-2">Item Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-[#111114] border border-white/5 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-orange-600/50 transition-all font-bold uppercase"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. VETEMENTS TOTAL F*CKING DARKNESS"
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-2">Price (/hr)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                required
                                                className="w-full bg-[#111114] border border-white/5 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-orange-600/50 transition-all font-mono"
                                                value={formData.price}
                                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                                placeholder="50"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-2">Category</label>
                                        <select
                                            className="w-full bg-[#111114] border border-white/5 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-orange-600/50 appearance-none font-bold text-xs uppercase cursor-pointer"
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            <option>Tops</option>
                                            <option>Hoodies</option>
                                            <option>Jackets</option>
                                            <option>Dresses</option>
                                            <option>Bottoms</option>
                                            <option>Shoes</option>
                                            <option>Accessories</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-2">Size</label>
                                        <select
                                            required
                                            className="w-full bg-[#111114] border border-white/5 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-orange-600/50 appearance-none font-bold text-xs uppercase cursor-pointer"
                                            value={formData.size}
                                            onChange={e => setFormData({ ...formData, size: e.target.value })}
                                        >
                                            <option value="">Select Size</option>
                                            <option>XS</option>
                                            <option>S</option>
                                            <option>M</option>
                                            <option>L</option>
                                            <option>XL</option>
                                            <option>Free Size</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-2">Brand</label>
                                        <input
                                            type="text"
                                            className="w-full bg-[#111114] border border-white/5 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-orange-600/50 transition-all font-bold uppercase text-xs"
                                            value={formData.brand}
                                            onChange={e => setFormData({ ...formData, brand: e.target.value })}
                                            placeholder="Brand Name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-2">Condition</label>
                                        <select
                                            className="w-full bg-[#111114] border border-white/5 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-orange-600/50 appearance-none font-bold text-xs uppercase cursor-pointer"
                                            value={formData.condition}
                                            onChange={e => setFormData({ ...formData, condition: e.target.value })}
                                        >
                                            <option value="new">New / Mint</option>
                                            <option value="good">Good Condition</option>
                                            <option value="worn">Worn / Vintage</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-2">Item MRP</label>
                                        <input
                                            type="number"
                                            required
                                            className="w-full bg-[#111114] border border-white/5 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-orange-600/50 transition-all font-mono"
                                            value={formData.retailPrice}
                                            onChange={e => setFormData({ ...formData, retailPrice: e.target.value })}
                                            placeholder="2000"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-2 [line-height:1.2]">Security Deposit Override</label>
                                        <input
                                            type="number"
                                            className="w-full bg-[#111114] border border-white/5 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-orange-600/50 transition-all font-mono"
                                            value={formData.securityDeposit}
                                            onChange={e => setFormData({ ...formData, securityDeposit: e.target.value })}
                                            placeholder="Auto-calculated"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-12">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 px-8 py-4 border border-white/10 text-gray-400 hover:text-white hover:border-white transition-all font-black uppercase text-[10px] tracking-[0.3em] rounded-xl"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-[2] bg-white text-black hover:bg-orange-600 hover:text-white px-8 py-4 font-black uppercase text-[10px] tracking-[0.3em] rounded-xl transition-all disabled:opacity-50 shadow-[0_4px_20px_rgba(255,255,255,0.1)]"
                                    >
                                        {loading ? 'Processing...' : 'Submit Listing'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
