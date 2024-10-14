import { User } from "@/Utility/Models/User.model";
import { dbConnect } from "@/Utility/db/dbConnect";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request:Request){
    try {
        const {userId} = auth()
        if(!userId){
            return NextResponse.json({error:"Invalid User"})
        }
        const dbConnectionStatus = await dbConnect();
        if(!dbConnectionStatus.status){
            return NextResponse.json({status:501, message:'Some Internal Error has Occurred'})
        }
        let newUser;
        newUser = await User.findOne({userId:userId});
        if(!newUser){
            newUser = new User({
                userId:userId
            })
            await newUser.save()   
        }
        return NextResponse.json({status:200, message:"User Auth is Done SuccessFully"})
    } catch (error:any) {
        console.log(`Error in saving User ${error.message}`)
        return NextResponse.json({status:500, message:"Internal Error Occured"})
    }
}


