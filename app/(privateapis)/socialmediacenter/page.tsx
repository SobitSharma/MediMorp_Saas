"use client";

import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useStore from '@/Utility/Store/Store';

const UploadComponent: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const updateMediadata = useStore((state) => state.updateUserMediaData);
  const mediaArray = useStore((state) => state.userMediaData) || [];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handlePlatformChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPlatform(event.target.value);
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedPlatform) {
      toast.error("Please select both a file and a platform.");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('option', selectedPlatform.toLowerCase());

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/social`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.json()
      if(result.status==200 && result.media){
        const temparray = [result.media, ...mediaArray]
        updateMediadata(temparray)
        toast.success("The media has been saved in the Media section.");
      }
      else{
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (err) {
      toast.error("An error occurred while saving the media.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <ToastContainer />
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Upload & Save Your Image
        </h2>

        {/* File Upload Section */}
        <div className="mb-6">
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Select an image to upload
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
          />
          {selectedFile && (
            <p className="mt-2 text-blue-600 text-sm">Selected file: {selectedFile.name}</p>
          )}
        </div>

        {/* Platform Selection Section */}
        <div className="mb-6">
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Select a platform
          </label>
          <select
            onChange={handlePlatformChange}
            value={selectedPlatform}
            className="select select-bordered w-full bg-gray-50 border border-gray-300 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>Choose a platform</option>
            <option value="portrait">Portrait</option>
            <option value="facebook">Facebook</option>
            <option value="twitter">Twitter</option>
          </select>
        </div>

        {/* Upload Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleUpload}
            className="btn btn-lg w-full max-w-xs bg-blue-600 text-white rounded-full py-3 px-6 font-semibold hover:bg-blue-700 transition-all duration-200 disabled:opacity-50"
            disabled={!selectedFile || !selectedPlatform || isLoading}
          >
            {isLoading ? 'Processing...' : 'Upload Media'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadComponent;
