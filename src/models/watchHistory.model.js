import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


// how to add the indexing 

const WatchHistorySchema = new Schema(
    {
        user_Id: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        video_Id: {
            type: Schema.Types.ObjectId,
            ref: "Video"
        },
        watchedAt:{
            type:Date,
            required: true,
            default: Date.now

        }
    },
    {
        timestamps: true
    }
)

WatchHistorySchema.plugin(mongooseAggregatePaginate)

WatchHistorySchema.index({userId:1,watchedAt: -1})

export const WatchHistory = mongoose.model("WatchHistory",WatchHistorySchema)