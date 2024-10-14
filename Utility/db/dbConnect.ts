import mongoose from "mongoose";

let dbConnectionStatus = false

export async function dbConnect(){
    const MONGODBURI = process.env.MONGODB_URI;
    console.log(MONGODBURI)
    if(!MONGODBURI){
        dbConnectionStatus = false
        return {
            status:false,
            message:'Please Define the MongoDBURI URL'
        }
    }
    if(!dbConnectionStatus){
        try {
            await mongoose.connect(MONGODBURI, {dbName:'MediaMorp'});
            dbConnectionStatus = true
            return {
                status:true,
                message:'DataBase Connected SuccessFully'
            }
        } catch (error:any) {
            console.log(`Error Occurred in Connecting The DataBase ${error.message}`);
            dbConnectionStatus = false
            return {
                status:false,
                message:"Error in Connected the DataBase"
            }
        }
    }
    return {status:true, message:"Data is Connected Already"}
}