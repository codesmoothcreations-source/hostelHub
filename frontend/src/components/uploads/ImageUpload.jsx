// src/components/uploads/ImageUpload.jsx
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useUpload } from '../../hooks/useUpload';
import { 
  FaUpload, 
  FaImage, 
  FaCheckCircle, 
  FaTimes, 
  FaSpinner,
  FaExclamationTriangle
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const ImageUpload = ({ 
  onUploadComplete, 
  maxFiles = 10,
  maxSize = 5 * 1024 * 1024, // 5MB
  accept = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/webp': ['.webp'],
    'image/gif': ['.gif']
  }
}) => {
  const { uploadFiles, uploading, progress, uploadedUrls, removeUrl, error } = useUpload();
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(file => {
        const errors = file.errors.map(err => err.message).join(', ');
        toast.error(`${file.file.name}: ${errors}`);
      });
      return;
    }

    if (acceptedFiles.length === 0) return;

    // Check total files limit
    const totalAfterUpload = uploadedUrls.length + acceptedFiles.length;
    if (totalAfterUpload > maxFiles) {
      toast.error(`Maximum ${maxFiles} images allowed. You have ${uploadedUrls.length} already.`);
      return;
    }

    console.log('Dropped files:', acceptedFiles);

    const result = await uploadFiles(acceptedFiles);
    
    if (result.success && result.urls.length > 0) {
      if (onUploadComplete) {
        onUploadComplete(result.urls);
      }
    }
  }, [uploadedUrls.length, maxFiles, uploadFiles, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: true,
    disabled: uploading || uploadedUrls.length >= maxFiles
  });

  const handleRemove = (index, e) => {
    e.stopPropagation();
    removeUrl(index);
    toast.success('Image removed');
  };

  const handleManualUrlAdd = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      try {
        new URL(url);
        if (url.startsWith('http')) {
          const newUrls = [...uploadedUrls, url];
          // In a real app, you would call setUploadedUrls through context/hook
          toast.success('Image URL added');
          if (onUploadComplete) {
            onUploadComplete([url]);
          }
        } else {
          toast.error('URL must start with http:// or https://');
        }
      } catch {
        toast.error('Please enter a valid URL');
      }
    }
  };

  return (
    <div className="hostelhub-image-upload">
      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`hostelhub-dropzone ${isDragActive ? 'hostelhub-dropzone-active' : ''} ${uploading ? 'hostelhub-dropzone-disabled' : ''}`}
        onMouseEnter={() => setDragActive(true)}
        onMouseLeave={() => setDragActive(false)}
      >
        <input {...getInputProps()} />
        
        <div className="hostelhub-dropzone-content">
          {uploading ? (
            <div className="hostelhub-uploading-state">
              <FaSpinner className="hostelhub-spinner" />
              <p>Uploading... {progress}%</p>
              <p className="hostelhub-upload-hint">Please wait</p>
            </div>
          ) : (
            <>
              <div className="hostelhub-dropzone-icon">
                {dragActive ? <FaImage /> : <FaUpload />}
              </div>
              <div className="hostelhub-dropzone-text">
                <h4>Drop images here or click to browse</h4>
                <p className="hostelhub-dropzone-hint">
                  Supports JPG, PNG, WebP, GIF (max {maxSize / 1024 / 1024}MB each)
                </p>
                <p className="hostelhub-dropzone-count">
                  {uploadedUrls.length} / {maxFiles} images uploaded
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="hostelhub-upload-error">
          <FaExclamationTriangle />
          <span>{error}</span>
        </div>
      )}

      {/* Uploaded Images Preview */}
      {uploadedUrls.length > 0 && (
        <div className="hostelhub-uploaded-images">
          <div className="hostelhub-images-header">
            <h4>Uploaded Images ({uploadedUrls.length})</h4>
            <button
              type="button"
              onClick={handleManualUrlAdd}
              className="hostelhub-add-url-button"
              disabled={uploadedUrls.length >= maxFiles}
            >
              Add URL
            </button>
          </div>
          
          <div className="hostelhub-images-grid">
            {uploadedUrls.map((url, index) => (
              <div key={index} className="hostelhub-image-preview">
                {/* <img 
                  src={url} 
                  alt={`Uploaded ${index + 1}`}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/150?text=Error';
                    e.target.style.opacity = '0.5';
                  }}
                /> */}
                <div className="hostelhub-image-overlay">
                  {/* <span className="hostelhub-image-number">#{index + 1}</span> */}
                  {/* <button
                    type="button"
                    onClick={(e) => handleRemove(index, e)}
                    className="hostelhub-remove-image"
                    title="Remove image"
                  >
                    <FaTimes />
                  </button> */}
                  {/* <div className="hostelhub-image-status">
                    <FaCheckCircle className="hostelhub-check-icon" />
                  </div> */}
                </div>
              </div>
            ))}
          </div>

          {uploadedUrls.length >= maxFiles && (
            <div className="hostelhub-max-files-warning">
              <FaExclamationTriangle />
              <span>Maximum {maxFiles} images reached</span>
            </div>
          )}
        </div>
      )}

      {/* Upload Tips */}
      <div className="hostelhub-upload-tips">
        <h5>Tips for better images:</h5>
        <ul>
          <li>Use clear, well-lit photos</li>
          <li>Show different angles of rooms</li>
          <li>Include common areas and amenities</li>
          <li>First image will be the main thumbnail</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageUpload;