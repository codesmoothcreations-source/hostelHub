// src/hooks/useUpload.js - ENHANCED WORKING VERSION
import { useState, useCallback } from 'react';
import { uploadsAPI } from '../api';
import { toast } from 'react-hot-toast';

export const useUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedUrls, setUploadedUrls] = useState([]);
  const [error, setError] = useState(null);

  /**
   * Validate file before upload
   */
  const validateFile = (file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const validTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp',
      'image/gif'
    ];

    if (file.size > maxSize) {
      return { valid: false, error: `"${file.name}" exceeds 5MB limit` };
    }

    if (!validTypes.includes(file.type)) {
      return { valid: false, error: `"${file.name}" must be an image (JPG, PNG, WebP, GIF)` };
    }

    return { valid: true };
  };

  /**
   * Main upload function - tries backend first, then Cloudinary
   */
  const uploadFiles = useCallback(async (files) => {
    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      // Validate all files first
      const validationResults = files.map(file => validateFile(file));
      const invalidFiles = validationResults.filter(result => !result.valid);
      
      if (invalidFiles.length > 0) {
        const errorMessages = invalidFiles.map(result => result.error).join(', ');
        throw new Error(errorMessages);
      }

      console.log(`Starting upload of ${files.length} files...`);

      let uploadedImageUrls = [];

      // Try backend upload first
      try {
        toast.loading(`Uploading ${files.length} image(s) to server...`);
        const backendUrls = await uploadsAPI.uploadToBackend(files);
        uploadedImageUrls = backendUrls;
        toast.dismiss();
        toast.success(`Uploaded ${uploadedImageUrls.length} image(s) successfully!`);
        
      } catch (backendError) {
        console.warn('Backend upload failed, trying Cloudinary...', backendError);
        toast.dismiss();
        toast.loading('Backend upload failed, trying Cloudinary...');

        // Fallback: Upload to Cloudinary one by one
        uploadedImageUrls = [];
        
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const progressPercent = Math.round(((i + 1) / files.length) * 100);
          setProgress(progressPercent);

          try {
            const cloudinaryUrl = await uploadsAPI.uploadToCloudinaryDirect(file);
            uploadedImageUrls.push(cloudinaryUrl);
            console.log(`Uploaded ${i + 1}/${files.length}: ${cloudinaryUrl}`);
          } catch (fileError) {
            console.error(`Failed to upload ${file.name}:`, fileError);
            // Continue with other files
          }
        }

        toast.dismiss();
        
        if (uploadedImageUrls.length > 0) {
          toast.success(`Uploaded ${uploadedImageUrls.length}/${files.length} images via Cloudinary`);
        } else {
          throw new Error('All upload methods failed');
        }
      }

      // Validate that we have proper URLs
      const validUrls = uploadedImageUrls.filter(url => {
        try {
          new URL(url);
          return url.startsWith('http');
        } catch {
          return false;
        }
      });

      if (validUrls.length === 0) {
        throw new Error('No valid image URLs were returned from upload');
      }

      // Update state
      const newUrls = [...uploadedUrls, ...validUrls];
      setUploadedUrls(newUrls);
      setProgress(100);

      return {
        success: true,
        urls: validUrls,
        count: validUrls.length,
        message: `Successfully uploaded ${validUrls.length} image(s)`
      };

    } catch (err) {
      console.error('Upload error:', err);
      const errorMessage = err.message || 'Upload failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      
      return {
        success: false,
        error: errorMessage,
        urls: []
      };
      
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, [uploadedUrls]);

  /**
   * Remove an uploaded URL
   */
  const removeUrl = useCallback((index) => {
    setUploadedUrls(prev => prev.filter((_, i) => i !== index));
  }, []);

  /**
   * Clear all uploaded URLs
   */
  const clearAll = useCallback(() => {
    setUploadedUrls([]);
    setError(null);
    setProgress(0);
  }, []);

  /**
   * Validate URL format
   */
  const validateUrl = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  return {
    // State
    uploading,
    progress,
    uploadedUrls,
    error,
    
    // Actions
    uploadFiles,
    removeUrl,
    clearAll,
    validateUrl,
    
    // Utility
    validateFile
  };
};