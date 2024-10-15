'use client';
import React, { useState } from 'react';
import useStore from '@/Utility/Store/Store';

export default function TransformationCenter() {
  const [mediaId, setMediaId] = useState('');
  const [selectedOption, setSelectedOption] = useState('round-corners');
  const [isLoading, setIsLoading] = useState(false);
  const [showMessage, setShowMessage] = useState('');
  const updateMediadata = useStore((state) => state.updateUserMediaData);
  const mediaArray = useStore((state) => state.userMediaData) || [];

  const handleTransform = async() => {
    setIsLoading(true);
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/transform`, {
      method:'POST',
      headers:{
        'Content-Type':'application/json',
      },
      body:JSON.stringify({mediaId:mediaId, tranformId:selectedOption})
    });
    const result = await response.json();
    if(result.status==200 && result.media){
      const temparray = [result.media, ...mediaArray]
      updateMediadata(temparray)
    }

    setIsLoading(false);
    setShowMessage(result.message);
    setTimeout(() => {
      setShowMessage('');
    }, 2000);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6 text-center">Transformation Center</h1>
      
      <div className="alert alert-info mb-4 flex justify-center items-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6 mr-2">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>Grab your Media ID and select a transformation option below</span>
      </div>
      
      <div className="mb-8">
        <input
          type="text"
          placeholder="Enter Media ID"
          className="input input-bordered w-full max-w-md mb-4"
          value={mediaId}
          onChange={(e) => setMediaId(e.target.value)}
        />
        <select
          className="select select-bordered w-full max-w-md mb-4"
          value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)}
        >
          <option value="round-corners">Round Corners</option>
          <option value="aiimageehance">AI Image Enhancer</option>
          <option value="upscale">UpScale Your Image</option>
        </select>
        <div className="w-full max-w-md flex justify-center items-center h-12">
          {!isLoading ? (
            <button className="btn btn-primary w-full" onClick={handleTransform}>
              Transform
            </button>
          ) : (
            <span className="loading loading-dots loading-lg"></span>
          )}
        </div>
      </div>
      {showMessage && (
        <div role="alert" className="alert mt-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-info h-6 w-6 shrink-0"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span>{showMessage}</span>
        </div>
      )}
    </div>
  );
}