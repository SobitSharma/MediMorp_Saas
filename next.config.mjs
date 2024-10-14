/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: ['img.clerk.com', 'res.cloudinary.com'], // Add Cloudinary to the allowed domains
    },
  };
  
  export default nextConfig;
  