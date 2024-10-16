"use client";
import { useState, useEffect, useMemo } from "react";
import { Copy, Trash2 } from "lucide-react";
import useStore from "@/Utility/Store/Store";
import Image from "next/image"; // Importing Next.js Image component

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
  const [initialLoading, setInitialLoading] = useState(false);
  const [deletingItems, setDeletingItems] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState("");
  const updateMediadata = useStore((state) => state.updateUserMediaData);
  const mediaArray = useStore((state) => state.userMediaData) || [];
  const [tempMediaArray, setTempMediaArray] = useState<MediaItem[]>([]);
  const [fullscreenMedia, setFullscreenMedia] = useState<MediaItem | null>(
    null
  );
  const [showMedia, setShowMedia] = useState(0);

  // Memoize mediaArray to avoid unnecessary re-renders
  const memoizedMediaArray = useMemo(() => mediaArray, [mediaArray]);

  useEffect(() => {
    setTempMediaArray(memoizedMediaArray);
  }, [memoizedMediaArray]);

  useEffect(() => {
    if (showMedia === 0) {
      setTempMediaArray(memoizedMediaArray);
    } else if (showMedia === 1) {
      const tempArray = memoizedMediaArray.filter(
        (item: MediaItem) => item.mediaId.mediaType !== "video"
      );
      setTempMediaArray(tempArray);
    } else {
      const tempArray = memoizedMediaArray.filter(
        (item: MediaItem) => item.mediaId.mediaType === "video"
      );
      setTempMediaArray(tempArray);
    }
  }, [showMedia, memoizedMediaArray]);

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
      const respons = await response.json();
      if (respons.status == 200 && respons.media) {
        const newArray = [respons.media, ...mediaArray];
        updateMediadata(newArray);
      }
    } catch (error) {
      console.log(error)
      throw new Error(
        "UnExpected Error While Uploading Your Media, Please Refresh And Do it Again"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (mediaId: string) => {
    try {
      console.log(mediaArray);
      console.log(mediaId);
      setDeletingItems((prev) => new Set(prev).add(mediaId));
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/deletemedia/${mediaId}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        console.log("Deleted successfully");
        const filteredData = mediaArray.filter(
          (item) => item.mediaId?._id !== mediaId
        );
        updateMediadata(filteredData);
      }
    } catch (error) {
      console.log(error)
      throw new Error(
        "UnExpected Error While Deleting Your Media, Please Refresh And Do it Again"
      );
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
      setInitialLoading(true);
      const api = `${process.env.NEXT_PUBLIC_API_URL}/api/getuserdata`;
      const response = await fetch(api, { method: "GET" });
      const data = await response.json();
      updateMediadata(data.data?.media || []);
    } catch (error) {
      console.log(error)
      console.error("Error fetching user data:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  const downloadTheMedia = async (imageUrl: string, fileName: string) => {
    try {
      const response = await fetch(imageUrl, { mode: "cors" });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Download error:", error.message);
      } else {
        console.error("Download error:", error);
      }
      throw error;
    }
  };

  useEffect(() => {
    if (!mediaArray.length) {
      fetchUserData();
    }
  }, []);

  const copyId = async (id: string) => {
    await navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(""), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {initialLoading ? (
        <div className="flex justify-center items-center min-h-screen">
          <span className="loading loading-bars loading-2xl"></span>
        </div>
      ) : (
        <div className="w-full max-w-[2000px] mx-auto px-4 py-6">
          {/* Header Section with Filter */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <h1 className="text-2xl font-bold text-white">Media Gallery</h1>
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Filters
                </h3>
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
                {tempMediaArray?.map((item: MediaItem) => (
                  <div
                    key={item._id}
                    className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all duration-300"
                  >
                    <figure
                      className="relative pt-[56.25%] cursor-pointer group"
                      onDoubleClick={() => handleFullscreen(item)}
                    >
                      <Image
                        src={item.mediaId.originalUrl}
                        alt={item.mediaId.fileName}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Example sizes for different viewports
                        style={{ objectFit: "cover" }}
                        className="absolute top-0 left-0 w-full h-full rounded-lg"
                      />
                    </figure>
                    <div className="card-body">
                      <h2 className="card-title text-base">
                        {item.mediaId.fileName}
                      </h2>
                      <p>
                        {item.mediaId.mediaType === "video" ? "Video" : "Image"}
                      </p>
                      <div className="card-actions justify-between">
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() =>
                            downloadTheMedia(
                              item.mediaId.originalUrl,
                              item.mediaId.fileName
                            )
                          }
                        >
                          Download
                        </button>
                        <button
                          className={`btn btn-sm btn-secondary ${
                            deletingItems.has(item._id) ? "loading" : ""
                          }`}
                          onClick={() => handleDelete(item.mediaId._id)}
                        >
                          <Trash2 className="mr-2" />
                        </button>
                        <button
                          className={`btn btn-sm ${
                            copiedId === item._id ? "btn-active" : ""
                          }`}
                          onClick={() => copyId(item.mediaId._id)}
                        >
                          {copiedId && copiedId == item.mediaId._id ? (
                            "Copied.."
                          ) : (
                            <Copy className="mr-2" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex justify-center items-center min-h-[800px] text-white">
                <h1>No Media Found</h1>
              </div>
            )}
          </div>
        </div>
      )}
      {fullscreenMedia && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-80">
          <div className="relative">
            <button
              className="absolute top-0 right-0 p-4 text-red-500 text-2xl"
              onClick={handleCloseFullscreen}
            >
              X
            </button>
            <Image
              src={fullscreenMedia.mediaId.originalUrl}
              alt={fullscreenMedia.mediaId.fileName}
              width={fullscreenMedia.mediaId.dimensions?.width || 800}
              height={fullscreenMedia.mediaId.dimensions?.height || 600}
              className="rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploadComponent;
