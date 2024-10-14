import React, { ReactNode } from 'react';
import { Image, Video, Share, Camera, FileImage, UserCircle, Settings } from 'lucide-react';
import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import { SignOutButton } from '@clerk/nextjs';

const AppLayout = async({ children }: { children: ReactNode }) => {
    const user = await currentUser()
    const userEmailAddress = user?.emailAddresses[0]?.emailAddress || "Unknown"
    const imageUrl = user?.imageUrl

    return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        <div className="navbar bg-base-100 shadow-md">
          <div className="flex-none lg:hidden">
            <label htmlFor="my-drawer-2" className="btn btn-square btn-ghost">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-6 h-6 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </label>
          </div>
          <div className="flex-1">
            <Link className="btn btn-ghost normal-case text-xl" href="/home">MediaMorph</Link>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden md:inline">{userEmailAddress}</span>
            <div className="avatar">
              <div className="w-10 rounded-full">
                {imageUrl ? (
                  <img src={imageUrl} alt="User profile" />
                ) : (
                  <UserCircle className="w-10 h-10" />
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          {children}
        </div>
      </div>
      
      <div className="drawer-side">
        <label htmlFor="my-drawer-2" className="drawer-overlay"></label> 
        <ul className="menu p-4 w-60 h-full bg-base-200 text-base-content">
          <li className="mb-2">
            <Link className="flex items-center" href="/media">
              <Image className="w-5 h-5 mr-2" />
              Media
            </Link>
          </li>
          <li className="mb-2">
            <Link className="flex items-center" href="/transform">
              <Camera className="w-5 h-5 mr-2" />
              Transformation Center
            </Link>
          </li>
          <li className="mb-2">
            <Link className="flex items-center" href="/socialmediacenter">
              <Share className="w-5 h-5 mr-2" />
              Social Media Center 
            </Link>
          </li>
          <li className="mt-auto">
            <SignOutButton redirectUrl={process.env.NEXT_PUBLIC_API_URL}>
            <button className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Logout
            </button>
            </SignOutButton>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AppLayout;