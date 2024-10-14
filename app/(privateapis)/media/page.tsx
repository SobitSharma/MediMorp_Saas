"use client";
import { useState, useEffect } from "react";
import { Copy, Trash2 } from "lucide-react";
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
  const [initialLoading, setInitialLoading] = useState(true);
  const [deletingItems, setDeletingItems] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState("");
  const updateMediadata = useStore((state) => state.updateUserMediaData);
  const mediaArray = useStore((state) => state.userMediaData) || [];
  const [tempMediaArray, setTempMediaArray] = useState<MediaItem[]>([]);
  const [fullscreenMedia, setFullscreenMedia] = useState<MediaItem | null>(null);
  const [showMedia, setShowMedia] = useState(0);

  useEffect(() => {
    setTempMediaArray(mediaArray);
  }, [mediaArray]);

  useEffect(() => {
    if (showMedia === 0) {
      setTempMediaArray(mediaArray);
    } else if (showMedia === 1) {
      const tempArray = mediaArray.filter((item: MediaItem) => item.mediaId.mediaType !== "video");
      setTempMediaArray(tempArray);
    } else {
      const tempArray = mediaArray.filter((item: MediaItem) => item.mediaId.mediaType === "video");
      setTempMediaArray(tempArray);
    }
  }, [showMedia, mediaArray]);

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
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });
      fetchUserData(); // Ensure this fetches the updated media data
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (mediaId: string) => {
    try {
      setDeletingItems((prev) => new Set(prev).add(mediaId));
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/deletemedia/${mediaId}`, {
        method: "DELETE",
      });
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

  const downloadTheMedia = async (imageUrl: string, fileName: string) => {
    try {
      const response = await fetch(imageUrl, { mode: 'cors' });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Download error:", error.message);
      throw error;
    }
  };

  useEffect(() => {
    fetchUserData();
    setInitialLoading(false);
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
      {initialLoading ? (
        <span className="loading loading-bars loading-lg"></span>
      ) : (
        <div className="w-full max-w-[2000px] mx-auto px-4 py-6">
          {/* Header Section with Filter */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <h1 className="text-2xl font-bold text-white">Media Gallery</h1>
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold text-white mb-2">Filters</h3>
                <div className="btn-group btn-group-vertical">
                  <button
                    className={`btn ${showMedia === 0 ? "btn-active" : ""}`}
                    onClick={() => setShowMedia(0)}
                  >
                    All
                  </button>
                  <button
                    className={`btn ${showMedia === 1 ? "btn-active" : ""}`}
                    onClick={() => setShowMedia(1)}
                  >
                    Images
                  </button>
                  <button
                    className={`btn ${showMedia === 2 ? "btn-active" : ""}`}
                    onClick={() => setShowMedia(2)}
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
                {tempMediaArray.map((item: MediaItem) => (
                  <div key={item._id} className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all duration-300">
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
                      <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-40 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex flex-col items-center gap-2">
                          <button className="btn btn-accent" onClick={() => downloadTheMedia(item.mediaId.originalUrl, item.mediaId.fileName)}>
                            Download
                          </button>
                          <button
                            className="btn btn-secondary"
                            onClick={() => copyId(item.mediaId._id)}
                          >
                            {copiedId === item.mediaId._id ? "Copied!" : <Copy />}
                          </button>
                          <button
                            className="btn btn-error"
                            onClick={() => handleDelete(item._id)}
                            disabled={deletingItems.has(item._id)}
                          >
                            {deletingItems.has(item._id) ? (
                              <span className="loading loading-spinner loading-xs"></span>
                            ) : (
                              <Trash2 />
                            )}
                          </button>
                        </div>
                      </div>
                    </figure>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-white text-center">No media found!</div>
            )}
          </div>

          {/* Fullscreen Modal */}
          {fullscreenMedia && (
            <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-75 z-50">
              <div className="relative">
                <button
                  className="absolute top-2 right-2 btn btn-circle btn-error"
                  onClick={handleCloseFullscreen}
                >
                  ✕
                </button>
                {fullscreenMedia.mediaId.mediaType === "video" ? (
                  <video
                    className="w-full max-w-[80vw] max-h-[80vh]"
                    src={fullscreenMedia.mediaId.originalUrl}
                    controls
                  />
                ) : (
                  <img
                    src={fullscreenMedia.mediaId.originalUrl}
                    alt={fullscreenMedia.mediaId.fileName}
                    className="w-full max-w-[80vw] max-h-[80vh] object-cover"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploadComponent;
