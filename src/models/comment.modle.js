import mongoose, { Schema } from "mongoose";

const CommentSchema = new Schema(
    {
        video_Id: {
            type: Schema.Types.ObjectId,
            ref: "Video"
        },
        user_Id: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        comment: {
            type: String,
            required: true
        }

    }, {
    timestamps: true
}
)

export const Comment = mongoose.model("Comment", CommentSchema)