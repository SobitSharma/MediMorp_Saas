import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { auth } from "@clerk/nextjs/server";
import { User } from "@/Utility/Models/User.model";
import { Media } from "@/Utility/Models/Media.model";

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

cloudinary.config({
  cloud_name: process.env.Cloud_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formdata = await request.formData();
    const file = formdata.get("file") as File;
    const MAX_FILE_SIZE = Number(process.env.MAX_ALLOWED_FILE_SIZE);

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds the ${MAX_FILE_SIZE} limit` },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult: CloudinaryUploadResult = await new Promise(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: file.type.startsWith("image/") ? "image" : "auto",
            folder: "mysaasMedia",
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else if (result) {
              resolve(result as unknown as CloudinaryUploadResult);
            } else {
              reject(new Error("Cloudinary response was undefined"));
            }
          }
        );
        stream.end(buffer);
      }
    );

    const currentUser = await User.findOne({ userId });
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const creatingNewMedia = new Media({
      publicId: uploadResult.public_id,
      mediaType: uploadResult.resource_type,
      originalUrl: uploadResult.secure_url,
      fileName: uploadResult.original_filename,
      fileSize: uploadResult.bytes,
      format: uploadResult.format || "unknown",
      dimensions: {
        width: uploadResult.width || 0,
        height: uploadResult.height || 0,
      },
      duration: uploadResult.duration || 0,
    });

    currentUser.media.push({
      mediaId: creatingNewMedia._id,
      mediaType: creatingNewMedia.mediaType,
    });
    currentUser.totalStorage += creatingNewMedia.fileSize;

    await Promise.all([creatingNewMedia.save(), currentUser.save()]);
    const createdResponse = {
      mediaId: {
        publicId: creatingNewMedia.publicId,
        mediaType: creatingNewMedia.mediaType,
        originalUrl: creatingNewMedia.originalUrl,
        fileName: creatingNewMedia.fileName,
        fileSize: creatingNewMedia.fileSize,
        format: creatingNewMedia.format,
        dimensions: creatingNewMedia.dimensions,
        duration: creatingNewMedia.duration,
        _id:creatingNewMedia._id
      },
      mediaType:creatingNewMedia.mediaType,
      _id:Date.now()
    };
    return NextResponse.json({
      status: 200,
      message: "Media uploaded successfully",
      media: createdResponse,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(`Error in saving User: ${error.message}`);
    } else {
      console.log("An unknown error occurred");
    }
    return NextResponse.json(
      { error: "Internal server error occurred" },
      { status: 500 }
    );
  }
}
