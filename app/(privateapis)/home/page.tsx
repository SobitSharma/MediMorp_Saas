"use client";
import React, { useEffect, useState } from "react";
import { FileDown, Wand2, Share, Clock, CloudLightning } from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import useStore from "@/Utility/Store/Store";

const HomePage: React.FC = () => {
  const { isLoaded, user } = useUser();
  const updateUserId = useStore((state) => state.updateUserId);
  const isUserLoggedIn = useStore((state) => state.isUserLoggedIn);
  const updateUserLoggedInStatus = useStore((state) => state.updateUserLoggedInStatus);
  const savedUserId = useStore((state) => state.userId);
  
  // Track if the API has been called
  const [apiCalled, setApiCalled] = useState<boolean>(false);

  useEffect(() => {
    // Check local storage on mount to update user logged in status
    const getItem = localStorage.getItem(`${process.env.SAAS_PLATFORM_USER}`);
    if (getItem) {
      updateUserLoggedInStatus();
    }
  }, [updateUserLoggedInStatus]);

  useEffect(() => {
    const saveUserData = async () => {
      if (!isLoaded || isUserLoggedIn || apiCalled) return; // Add apiCalled check here

      const userId = user?.id;
      if (userId && !savedUserId) {
        updateUserId(userId);
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/savinguser`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        });
        if (response.ok) {
          localStorage.setItem(`${process.env.SAAS_PLATFORM_USER}`, "true");
          updateUserLoggedInStatus();
          setApiCalled(true); // Set apiCalled to true after successful call
        }
      } catch (error) {
        throw new Error("Some Problem Occurred While Saving User, Please Click Below Refresh")
      }
    };

    saveUserData();
  }, [isLoaded, isUserLoggedIn, updateUserId, updateUserLoggedInStatus, user?.id, savedUserId, apiCalled]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="hero bg-base-200 rounded-lg mb-8 p-8">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold mb-5">Transform Your Media</h1>
            <p className="text-lg mb-5">
              Your all-in-one solution for image and video transformation, compression, and sharing.
            </p>
            <Link href="/media">
              <p className="btn btn-primary">Get Started</p>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Cards for services offered */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <Wand2 className="w-12 h-12 mb-4 text-primary" />
            <h2 className="card-title">Transform Images</h2>
            <p>Convert your photos into various formats: Instagram-perfect, passport size, LinkedIn profile, and more!</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <FileDown className="w-12 h-12 mb-4 text-primary" />
            <h2 className="card-title">Smart Compression</h2>
            <p>Reduce file sizes without losing quality. Store more photos and videos while keeping them crystal clear.</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <CloudLightning className="w-12 h-12 mb-4 text-primary" />
            <h2 className="card-title">Lightning Fast</h2>
            <p>Process your media in seconds. Our optimized algorithms ensure quick transformations every time.</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <Share className="w-12 h-12 mb-4 text-primary" />
            <h2 className="card-title">Easy Sharing</h2>
            <p>Share your transformed media directly to social platforms or via secure links.</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Multiple Formats</h2>
            <p>Support for a wide range of image and video formats. Convert between formats with ease.</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <Clock className="w-12 h-12 mb-4 text-primary" />
            <h2 className="card-title">Batch Processing</h2>
            <p>Transform multiple files at once. Save time by processing your media in batches.</p>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to transform your media?</h2>
        <Link className="btn btn-primary btn-lg" href="/transform">Start Now</Link>
      </div>
    </div>
  );
};

export default HomePage;
