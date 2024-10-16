"use client";
import React, { useEffect, useState } from "react";
import { FileDown, Wand2, Share, Clock, CloudLightning } from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import useStore from "@/Utility/Store/Store";
import { useRouter } from "next/navigation";

const HomePage: React.FC = () => {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const { isUserLoggedIn, updateUserLoggedInStatus } = useStore();

  const storingUser = async () => {
    if (!isSignedIn) {
      router.push("/signin");
    } else {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/savinguser`,
        {
          method: "GET",
        }
      );
      const result = await response.json();
      if (result.status == 200) {
        updateUserLoggedInStatus(true);
      } else {
        router.push("/home");
      }
    }
  };

  useEffect(() => {
    if (!isUserLoggedIn) {
      storingUser();
    }
  }, [isSignedIn, isLoaded]);

  return (
    <div>
      {isLoaded ? (
        <div className="container mx-auto px-4 py-8">
          <div className="hero bg-base-200 rounded-lg mb-8 p-8">
            <div className="hero-content text-center">
              <div className="max-w-md">
                <h1 className="text-5xl font-bold mb-5">
                  Transform Your Media
                </h1>
                <p className="text-lg mb-5">
                  Your all-in-one solution for image and video transformation,
                  compression, and sharing.
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
                <p>
                  Convert your photos into various formats: Instagram-perfect,
                  passport size, LinkedIn profile, and more!
                </p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <FileDown className="w-12 h-12 mb-4 text-primary" />
                <h2 className="card-title">Smart Compression</h2>
                <p>
                  Reduce file sizes without losing quality. Store more photos
                  and videos while keeping them crystal clear.
                </p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <CloudLightning className="w-12 h-12 mb-4 text-primary" />
                <h2 className="card-title">Lightning Fast</h2>
                <p>
                  Process your media in seconds. Our optimized algorithms ensure
                  quick transformations every time.
                </p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <Share className="w-12 h-12 mb-4 text-primary" />
                <h2 className="card-title">Easy Sharing</h2>
                <p>
                  Share your transformed media directly to social platforms or
                  via secure links.
                </p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Multiple Formats</h2>
                <p>
                  Support for a wide range of image and video formats. Convert
                  between formats with ease.
                </p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <Clock className="w-12 h-12 mb-4 text-primary" />
                <h2 className="card-title">Batch Processing</h2>
                <p>
                  Transform multiple files at once. Save time by processing your
                  media in batches.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to transform your media?
            </h2>
            <Link className="btn btn-primary btn-lg" href="/transform">
              Start Now
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
          <div className="flex flex-col items-center">
            <span className="loading loading-spinner loading-lg text-blue-500"></span>
            <p className="mt-4 text-lg text-gray-700">Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
