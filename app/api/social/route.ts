import { NextResponse } from "next/server";
import { v2 as cloudinary } from 'cloudinary';
import { auth } from "@clerk/nextjs/server";
import { Media } from "@/Utility/Models/Media.model";
import { User } from "@/Utility/Models/User.model";

cloudinary.config({
    cloud_name: process.env.Cloud_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

interface CloudinaryUploadResult {
    asset_id?: string;
    public_id: string;
    width?: number;
    height?: number;
    format: string;
    resource_type: string;
    created_at: string;
    bytes: number;
    url: string;
    secure_url: string;
    original_filename: string;
    duration?: number;
}

interface TransformationOptions {
    gravity?: string;
    width?: number;
    height?: number;
    crop?: string;
}

export async function POST(request: Request) {
    try {
        const { userId } = auth();
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const option = formData.get('option') as string | null;

        if (!file || !option) {
            return NextResponse.json({ status: 400, message: 'Invalid file or option received!' });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        let transformationOptions: TransformationOptions = {};

        switch (option) {
            case 'portrait':
                transformationOptions = {
                    gravity: "auto",
                    width: 1080,
                    height: 1350,
                    crop: "fill"
                };
                break;
            case 'facebook':
                transformationOptions = {
                    width: 1200,
                    height: 630,
                    crop: "fill"
                };
                break;
            case 'twitter':
                transformationOptions = {
                    width: 1200,
                    height: 675,
                    crop: "fill"
                };
                break;
            default:
                return NextResponse.json({ status: 400, message: 'Invalid option' });
        }

        const uploadResult: CloudinaryUploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    resource_type: file.type.startsWith('image/') ? 'image' : 'auto',
                    folder: 'mysaasMedia',
                    transformation: [transformationOptions],
                    format: 'jpg'
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else if (result) {
                        resolve(result as CloudinaryUploadResult);
                    } else {
                        reject(new Error("Cloudinary response was undefined"));
                    }
                }
            );
            stream.end(buffer);
        });

        const newMedia = new Media({
            publicId: uploadResult.public_id,
            mediaType: uploadResult.resource_type,
            originalUrl: uploadResult.secure_url,
            fileName: uploadResult.original_filename,
            fileSize: uploadResult.bytes,
            format: uploadResult.format,
            dimensions: { width: uploadResult.width, height: uploadResult.height },
            duration: 0,
            transformationType: "transformed"
        });

        const currentUser = await User.findOne({ userId });
        if (!currentUser) {
            return NextResponse.json({ status: 404, message: 'User not found' });
        }

        currentUser.totalStorage += newMedia.fileSize;
        currentUser.media = [{ mediaId: newMedia._id, mediaType: 'image' }, ...currentUser.media];

        await Promise.all([currentUser.save(), newMedia.save()]);
        const createdResponse = {
            mediaId: {
              publicId: newMedia.publicId,
              mediaType: newMedia.mediaType,
              originalUrl: newMedia.originalUrl,
              fileName: newMedia.fileName,
              fileSize: newMedia.fileSize,
              format: newMedia.format,
              dimensions: newMedia.dimensions,
              duration: newMedia.duration,
              _id:newMedia._id
            },
            mediaType:newMedia.mediaType,
            _id:Date.now()
          };

        return NextResponse.json({ status: 200, message: 'Success', media : createdResponse});
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.log(`Error in saving User: ${error.message}`);
        } else {
            console.log('An unknown error has occurred');
        }
        return NextResponse.json({ status: 500, message: 'Internal server error' });
    }
}
