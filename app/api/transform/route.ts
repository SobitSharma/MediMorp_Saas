import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { dbConnect } from "@/Utility/db/dbConnect";
import { Media } from "@/Utility/Models/Media.model";
import { User } from "@/Utility/Models/User.model";
import {v2 as cloudinary} from "cloudinary"

cloudinary.config({
    cloud_name: process.env.Cloud_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
}); 

export async function POST(request:Request){
    try {
        const body = await request.json()
        const {userId} = auth()
        const {mediaId, tranformId} = body
        if(!userId){
            return NextResponse.json({status:501, message:'Invalid User'})
        }
        if(!mediaId || !tranformId){
            return NextResponse.json({status:400, message:'Invalid Arguments Passed'})
        }
        const dbConnectionStatus = await dbConnect();
        if(!dbConnectionStatus.status){
            return NextResponse.json({status:501, message:'Some Internal Error has Occurred'})
        }
    
        const mediaThatNeedsToBeTransformed = await Media.findById(mediaId);
        if(!mediaThatNeedsToBeTransformed){
            return NextResponse.json({status:400, message:'Invalid Media Id'})
        }
        if(mediaThatNeedsToBeTransformed.transformationType && mediaThatNeedsToBeTransformed.transformationType == 'transformed'){
            return NextResponse.json({status:400, message:'The transformed cannot be re-tranfomed, Please Provide the Id of the Original Media'})
        }
        if(mediaThatNeedsToBeTransformed.mediaType == "video"){
            return NextResponse.json({status:400, message:"Sorry Right Now The Transformation is Available only for Images"})
        }
        let mediaType = mediaThatNeedsToBeTransformed.mediaType
        let transformedMedia;
        if(tranformId == 'round-corners'){
            if(mediaType == 'image'){
                transformedMedia = await cloudinary.uploader.explicit(mediaThatNeedsToBeTransformed.publicId, {
                    type: 'upload',  
                    resource_type:'image',
                    transformation: [
                        { aspect_ratio: "1:1", gravity: "auto", width: 500, crop: "fill" },
                        { radius: "max" }
                    ],
                    eager: [  
                        {
                            width: 500, crop: "fill", gravity: "auto", aspect_ratio: "1:1", radius: "max"
                        }
                    ],
                    folder:'mysaasMedia'
                }, );
                       
            }
            else if(mediaType == 'video'){
                // console.log("In voidep");
                // transformedMedia = await cloudinary.uploader.explicit(mediaThatNeedsToBeTransformed.publicId, {
                //     type: 'upload', 
                //     resource_type:'video', 
                //     eager: [  
                //         {
                //             gravity:'auto',
                //         },
                //         {
                //             width: 500, crop: "fill", aspect_ratio: "1:1", radius: "max"
                //         }
                //     ]
                // }, );
                return NextResponse.json({status:501, message:'Sorry Right Now Video Transformation is not available'})
            }
        }
        else if(tranformId == 'aiimageehance'){
            if(mediaThatNeedsToBeTransformed.mediaType == "image"){
                transformedMedia = await cloudinary.uploader.explicit(mediaThatNeedsToBeTransformed.publicId, {
                    type:'upload',
                    resource_type:'image',
                    transformation:[
                        {effect:'enhance'},
                    ],
                    eager:[
                        {
                            transformation:[{effect:'enhance'}]
                        }
                    ]
                })
            }
            else{
                return NextResponse.json({status:400, message:"Right Now This Feature is Only Available for Images"})
            }
        }
        else if(tranformId == 'upscale'){
            if(mediaThatNeedsToBeTransformed.mediaType == 'image'){
                transformedMedia = await cloudinary.uploader.explicit(mediaThatNeedsToBeTransformed.publicId, {
                    type:'upload',
                    resource_type:'image',
                    transformation:[
                        {effect:'upscale'}
                    ],
                    eager:[
                        {
                            transformation:[{effect:'upscale'}]
                        }
                    ]

                })
            }
        }

        let newMedia = new Media({
            publicId: transformedMedia.public_id,
            mediaType:transformedMedia.resource_type,
            originalUrl:transformedMedia.eager[0]?.secure_url,
            fileName:"transformedFile",
            fileSize:transformedMedia.eager[0]?.bytes ,
            format:transformedMedia.format,
            dimensions:{
                width:transformedMedia.eager[0]?.width,
                height:transformedMedia.eager[0]?.height
            },
            duration:mediaThatNeedsToBeTransformed.duration,
            transformationType:"transformed",
        })
        const currentUser = await User.findOne({userId:userId});
        if(!currentUser){
            return NextResponse.json({message:"User is not Authenticated", status:400})
        }
        currentUser.media.push({
            mediaId: newMedia._id,
            mediaType: newMedia.mediaType
        })
        currentUser.totalStorage += newMedia.fileSize

        await Promise.all([currentUser.save(), newMedia.save()])
        return NextResponse.json({message:"The Media Has been tranformed You can see that in your Media tab", status:200})
    } catch (error:unknown) {
        if (error instanceof Error) {
            console.log(`Error in saving User: ${error.message}`);
        } else {
            console.log('An unknown error occurred');
        }
        return NextResponse.json({status:501, message:"Some Error Occurred"})
    }


}