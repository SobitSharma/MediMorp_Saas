import { v2 as cloudinary } from "cloudinary";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { User } from "@/Utility/Models/User.model";
import { Media } from "@/Utility/Models/Media.model";
import mongoose from "mongoose";

cloudinary.config({
    cloud_name: process.env.Cloud_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const { userId } = auth();
        const { id } = params;

        if (!userId) {
            return NextResponse.json({ error: 'Invalid User' }, { status: 401 });
        }
        if (!id || !mongoose.isValidObjectId(id)) {
            return NextResponse.json({ error: 'Invalid Media Id Requested For Deletion' }, { status: 400 });
        }

        // Find and delete the media document
        const mediaToBeDeleted = await Media.findByIdAndDelete(id);
        if (!mediaToBeDeleted) {
            return NextResponse.json({ error: 'Media not found' }, { status: 404 });
        }

        // Update user's media array 
        const result = await User.updateOne(
            { userId },
            { 
                $pull: { 
                    media: { 
                        mediaId: new mongoose.Types.ObjectId(id) 
                    } 
                } 
            }
        );

        if (result.modifiedCount === 0) {
            console.log("No user document was modified");
        }

        // The image has to be cleared from the Cloudinary also
        if (mediaToBeDeleted.publicId) {
            await cloudinary.api.delete_resources([mediaToBeDeleted.publicId])
        }

        return NextResponse.json({ message: "Media Deleted Successfully" });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.log(`Error in saving User: ${error.message}`);
        } else {
            console.log('An unknown error occurred');
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}