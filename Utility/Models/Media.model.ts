import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema({
    publicId:{
        type:String,
        required:true
    },
    mediaType: {
        type: String,
        required: true,
    },
    originalUrl: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number,  
        required: true
    },
    format: {
        type: String,  
        required: true
    },
    // Fields for images and transformed media
    dimensions: {
        width: Number,
        height: Number
    },
    // Fields for videos
    duration: {
        type: Number  // in seconds
    },
    // Fields for transformed media
    transformationType: {
        type: String,  // e.g., 'compressed', 'instagram', 'passport'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export const Media = mongoose.models.Media || mongoose.model('Media', mediaSchema);