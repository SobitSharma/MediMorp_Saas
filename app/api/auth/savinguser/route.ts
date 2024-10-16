import { User } from "@/Utility/Models/User.model";
import { dbConnect } from "@/Utility/db/dbConnect";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        console.log('Incoming Rewust')
        const { userId } = auth();
        if (!userId) {
            return NextResponse.json({ error: "Invalid User" });
        }
        
        const dbConnectionStatus = await dbConnect();
        if (!dbConnectionStatus.status) {
            return NextResponse.json({ status: 501, message: 'Some Internal Error has Occurred' });
        }
        
        let newUser = await User.findOne({ userId: userId });
        if (!newUser) {
            newUser = new User({
                userId: userId
            });
            await newUser.save();
        }
        
        return NextResponse.json({ status: 200, message: "User Auth is Done Successfully" });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.log(`Error in saving User: ${error.message}`);
        } else {
            console.log('An unknown error occurred');
        }
        return NextResponse.json({ status: 500, message: "Internal Error Occurred" });
    }
}