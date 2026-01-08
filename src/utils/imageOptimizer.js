/**
 * Optimizes Cloudinary image URLs with automatic transformations
 * @param {string} url - Original image URL
 * @param {object} options - Transformation options
 * @returns {string} - Optimized image URL
 */
export const optimizeCloudinaryImage = (url, options = {}) => {
    if (!url || !url.includes('cloudinary')) {
        return url;
    }

    const {
        width = 'auto',
        height = 'auto',
        quality = 'auto',
        format = 'auto',
        crop = 'limit',
        dpr = 'auto'
    } = options;

    // Split the URL at '/upload/' to insert transformations
    const parts = url.split('/upload/');
    if (parts.length !== 2) return url;

    // Build transformation string
    const transformations = [
        width !== 'auto' && `w_${width}`,
        height !== 'auto' && `h_${height}`,
        `c_${crop}`,
        `q_${quality}`,
        `f_${format}`,
        `dpr_${dpr}`
    ].filter(Boolean).join(',');

    // Reconstruct URL with transformations
    return `${parts[0]}/upload/${transformations}/${parts[1]}`;
};

/**
 * Get optimized image URL based on usage context
 */
export const getOptimizedImageUrl = (url, context = 'post') => {
    const contexts = {
        'profile-small': { width: 80, height: 80, crop: 'fill' },
        'profile-large': { width: 200, height: 200, crop: 'fill' },
        'post': { width: 1200, quality: 85 },
        'thumbnail': { width: 400, height: 400, crop: 'fill' },
        'feed': { width: 800, quality: 80 }
    };

    return optimizeCloudinaryImage(url, contexts[context] || {});
};
