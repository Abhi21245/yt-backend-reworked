import mongoose, { model, Schema } from "mongoose";

const LikeSchema = new Schema(
    {
        video_id :{
            type : Schema.Types.ObjectId,
            ref: "Video"
        },
   
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }

    },{timestamps:true}

)



export const Like = mongoose.model("Like",LikeSchema)