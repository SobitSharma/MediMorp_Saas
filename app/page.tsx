import React from 'react';
import { FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import Link from 'next/link';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 text-gray-800">
      <div className="flex flex-col items-center justify-center max-w-xl p-8 rounded-3xl shadow-xl bg-white bg-opacity-90 backdrop-blur-lg text-center space-y-8 animate-fadeIn">
        
        <h1 className="text-4xl font-semibold text-gray-900 animate-slideInUp">
          Simplify Your Media Sharing Experience
        </h1>
        
        <p className="text-lg md:text-xl text-gray-700 leading-relaxed animate-fadeInUp delay-200">
          Store, optimize, and share your media effortlessly. Control visibility and compress files without compromising quality.
        </p>
        
        <div className="flex space-x-6">
        <Link href="/signin">
          <button className="btn btn-outline btn-primary btn-lg flex items-center space-x-2 animate-slideInLeft">
            <FaSignInAlt size={20} />
            <span>Sign In</span>
          </button>
          </Link>
          <Link href="/signup">
          <button className="btn btn-primary btn-lg flex items-center space-x-2 animate-slideInRight">
            <FaUserPlus size={20} />
            <span>Sign Up</span>
          </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
