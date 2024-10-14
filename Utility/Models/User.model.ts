import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    media: [{
        mediaId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Media'
        },
        mediaType: {
            type: String,
        }
    }],
    totalStorage: {
        type: Number,
        default: 0  // in bytes
    }
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);