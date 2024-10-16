MediaMorp - Full Stack Media Storage and Editing Application
This is a full-stack media storage and editing application built with Next.js. MediaMorp allows users to store, enhance, and transform their media files with ease.

Setup Instructions
To get started, follow these steps to clone the repository and set up your environment.

Step 1: Clone the Repository
git clone [repository-url]
Step 2: Environment Configuration
Create a .env or .env.local file in the root directory and add the following environment variables:

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=  # Required for deployment, get it from Clerk
CLERK_SECRET_KEY=                   # Clerk secret key from Clerk dashboard
MONGODB_URI=                        # MongoDB connection URI

NEXT_PUBLIC_API_URL=http://localhost:3000
CLOUD_NAME=                         # Cloudinary cloud name
API_KEY=                            # Cloudinary API key
API_SECRET=                         # Cloudinary API secret
MAX_ALLOWED_FILE_SIZE=30*1024*1024  # Set max file size (adjust as needed)
SAAS_PLATFORM_USER=saasplatformuser # Modify this as per your setup
Step 3: Install Dependencies and Run
Install the necessary dependencies and start the development server:

npm install
npm run dev

Your project should now be up and running at http://localhost:3000.

Live Demo
Check out a live demo of the application: https://mediatools.site
