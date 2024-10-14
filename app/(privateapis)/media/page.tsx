"use client";
import { useState, useEffect } from "react";
import {Copy,Trash2} from "lucide-react";
import useStore from "@/Utility/Store/Store";

interface Dimensions {
  width: number;
  height: number;
}

interface MediaItem {
  _id: string;
  mediaId: {
    _v: number;
    duration: number;
    fileName: string;
    fileSize: number;
    format: string;
    mediaType: string;
    originalUrl: string;
    dimensions?: Dimensions;
    createdAt: string;
    _id: string;
  };
}

const ImageUploadComponent = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [initialLoading, setinitialLoading] = useState(true)
  const [deletingItems, setDeletingItems] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState("");
  const updateMediadata = useStore((state: any) => state.updateUserMediaData);
  const mediaArray = useStore((state: any) => state.userMediaData) || [];
  const [tempmediaArray, settempmediaArray] = useState([]);
  const [fullscreenMedia, setFullscreenMedia] = useState<MediaItem | null>(
    null
  );
  const [showmedia, setshowmedia] = useState(0);

  useEffect(() => {
    settempmediaArray(mediaArray);
  }, [mediaArray]);

  useEffect(() => {
    if (showmedia == 0) {
      settempmediaArray(mediaArray);
    } else if (showmedia == 1) {
      let tempArray = mediaArray?.filter(
        (item: MediaItem) => item.mediaId.mediaType !== "video"
      );
      settempmediaArray(tempArray);
    } else {
      let tempArray = mediaArray?.filter(
        (item: MediaItem) => item.mediaId.mediaType == "video"
      );
      settempmediaArray(tempArray);
    }
  }, [showmedia]);

  const handleFullscreen = (item: MediaItem) => {
    setFullscreenMedia(item);
  };

  const handleCloseFullscreen = () => {
    setFullscreenMedia(null);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const result = await response.json();
      fetchUserData();
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (mediaId: string) => {
    try {
      setDeletingItems((prev) => new Set(prev).add(mediaId));
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/deletemedia/${mediaId}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        console.log("Deleted successfully");
        await fetchUserData();
      }
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setDeletingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(mediaId);
        return newSet;
      });
    }
  };

  const fetchUserData = async () => {
    try {
      const api = `${process.env.NEXT_PUBLIC_API_URL}/api/getuserdata`;
      const response = await fetch(api, { method: "GET" });
      const data = await response.json();
      updateMediadata(data.data?.media || []);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const downloadTheMedia = async(imageUrl:string, nameofFile:string, format:string) => {
    try {
      const filename = nameofFile
      const response = await fetch(imageUrl, {mode:'cors'});
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
  
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error:any) {
      console.log(error.message)
      throw error;
    }
  }

  useEffect(() => {
    fetchUserData();
    setinitialLoading(false)
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const copyId = async (id: string) => {
    await navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(""), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {
        initialLoading ? <span className="loading loading-bars loading-lg"></span> : 
        <div className="w-full max-w-[2000px] mx-auto px-4 py-6">
        {/* Header Section with Filter */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-2xl font-bold text-white">Media Gallery</h1>
          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-semibold text-white mb-2">Filters</h3>
              <div className="btn-group btn-group-vertical">
                <button
                  className={`btn ${showmedia === 0 ? "btn-active" : ""}`}
                  onClick={() => setshowmedia(0)} 
                >
                  All
                </button>
                <button
                  className={`btn ${showmedia === 1 ? "btn-active" : ""}`}
                  onClick={() => setshowmedia(1)}
                >
                  Images
                </button>
                <button
                  className={`btn ${showmedia === 2 ? "btn-active" : ""}`}
                  onClick={() => setshowmedia(2)}
                >
                  Videos
                </button>
              </div>
            </div>
            {!isUploading ? (
              <label className="btn btn-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Upload Media
                <input
                  type="file"
                  className="hidden"
                  onChange={handleUpload}
                  accept="image/*,video/*"
                />
              </label>
            ) : (
              <div className="flex items-center text-white">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full min-h-[800px]">
          {mediaArray.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tempmediaArray?.map((item: MediaItem) => (
                <div                   
                key={item._id}                   
                className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all duration-300"                 
              >                   
                <figure                     
                  className="relative pt-[56.25%] cursor-pointer group"                     
                  onDoubleClick={() => handleFullscreen(item)}                   
                >                     
                  {item.mediaId.mediaType === "video" ? (                       
                    <video                         
                      className="absolute top-0 left-0 w-full h-full object-cover"                         
                      src={item.mediaId.originalUrl}                         
                      controls                       
                    />                     
                  ) : (                       
                    <img                         
                      src={item.mediaId.originalUrl}                         
                      alt={item.mediaId.fileName}                         
                      className="absolute top-0 left-0 w-full h-full object-cover"                       
                    />                     
                  )}
                  {/* Download overlay icon */}
                  <button
                    className="absolute top-2 right-2 btn btn-circle btn-sm btn-ghost bg-base-100/50 hover:bg-base-100 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={()=>{downloadTheMedia(item.mediaId.originalUrl, item.mediaId.fileName, item.mediaId.format)}}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                </figure>                   
                <div className="card-body p-4">                     
                  <div className="grid grid-cols-2 gap-2 text-sm text-base-content/70">                       
                    <div className="flex justify-between col-span-2">                         
                      <span>{item.mediaId.mediaType}</span>                         
                      <span>{formatFileSize(item.mediaId.fileSize)}</span>                       
                    </div>                       
                    { item.mediaId.duration > 0 &&                          
                      <div className="flex justify-between col-span-2">                         
                        <span>Duration</span>                         
                        <span>{item.mediaId.duration}s</span>                       
                      </div>                       
                    }                       
                    {item.mediaId.dimensions && (                         
                      <div className="flex justify-between col-span-2">                           
                        <span>Dimensions</span>                         
                        <div className="col-span-2 text-xs opacity-70">                           
                          {item.mediaId.dimensions.width} x{" "}                           
                          {item.mediaId.dimensions.height}                         
                        </div>                         
                      </div>                       
                    )}                     
                  </div>                     
                  <div className="card-actions justify-between mt-4">                       
                    {deletingItems.has(item.mediaId._id) ? (                         
                      <span className="loading loading-spinner loading-md"></span>                       
                    ) : (
                      <div className="flex gap-2">                         
                        <button                           
                          className="btn btn-error btn-sm"                           
                          onClick={() => handleDelete(item.mediaId._id)}                         
                        >                           
                          <Trash2 className="w-4 h-4" />                                                    
                        </button>
                        <button                         
                          className="btn btn-primary btn-sm"                         
                          onClick={() => copyId(item.mediaId._id)}                       
                        >                         
                          <Copy className="w-4 h-4" />
                          <span className="hidden sm:inline ml-1">
                            {copiedId === item.mediaId._id ? "Copied!" : "Copy ID"}
                          </span>                      
                        </button>
                      </div>                       
                    )}                       
                  </div>                   
                </div>                 
              </div>
              ))}
            </div>
          ) : (
            <div className="hero min-h-[400px] bg-base-200 rounded-box">
              <div className="hero-content text-center">
                <div className="max-w-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mx-auto text-base-content/50 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                    />
                  </svg>
                  <h3 className="text-xl font-bold">No media uploaded yet</h3>
                  <p className="py-6">Start uploading to see your gallery!</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fullscreen Modal */}
        {fullscreenMedia && (
          <div
            className="fixed inset-0 z-50 bg-black/90 flex justify-center items-center"
            onClick={handleCloseFullscreen}
          >
            <div className="relative max-w-7xl max-h-[90vh]">
              {fullscreenMedia.mediaId.mediaType === "video" ? (
                <video
                  className="max-w-full max-h-[90vh]"
                  src={fullscreenMedia.mediaId.originalUrl}
                  controls
                  autoPlay
                />
              ) : (
                <img
                  src={fullscreenMedia.mediaId.originalUrl}
                  alt={fullscreenMedia.mediaId.fileName}
                  className="max-w-full max-h-[90vh]"
                />
              )}
              <button
                className="btn btn-circle btn-error absolute top-4 right-4"
                onClick={handleCloseFullscreen}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
      }
    </div>
  );
};

export default ImageUploadComponent;
