const config = {
    API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    CLOUDINARY: {
        CLOUD_NAME: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
        UPLOAD_PRESET: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
    },
};

export default config;
