import { User } from "@/Utility/Models/User.model";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { dbConnect } from "@/Utility/db/dbConnect";
import { Media } from "@/Utility/Models/Media.model";

export async function GET(){
    try {
        const {userId} = auth()
        if(!userId){
            return NextResponse.json({error:'UnVerified User'})
        }
        const dbConnectionStatus = await dbConnect();
        if(!dbConnectionStatus.status){
            return NextResponse.json({status:501, message:'Some Internal Error has Occurred'})
        }
        const currentUser = await User.findOne({userId:userId}).populate({
            path:'media.mediaId',
            model:Media
        })
        return NextResponse.json({status:200, message:"Sucess", data:currentUser})
    } catch (error:unknown) {
        if (error instanceof Error) {
            console.log(`Error in saving User: ${error.message}`);
        } else {
            console.log('An unknown error occurred');
        }
        return NextResponse.json({error:"Some Error Occurred"})
    }
}