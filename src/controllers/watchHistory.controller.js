import { WatchHistory } from "../models/watchHistory.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
// import { useId } from "react";
// import { response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const { ObjectId } = mongoose.Types


const addVideoInWatchHistory = asyncHandler(async (req, res) => {

    // const video_id = req.body.video._id
    // const user_id = req.user._id

    const video_id = req.body._id
    const user_id = req.user._id


    // console.log("This is the video id", video_id)
    // console.log("This is the user id", user_id)


    if (!video_id) {
        throw new ApiError(401, "Video id required")

    }

    if (!user_id) {
        throw new ApiError(401, "User id required")

    }

    // console.log("i reached here before result")

    const result = await WatchHistory.findOne({
        user_Id: new ObjectId(user_id),
        video_Id: new ObjectId(video_id)
    });

    // console.log("result is ",result)

    if (result) {

        const updatedDoc = await WatchHistory.findOneAndUpdate(
            { user_Id: user_id, video_Id: video_id },
            { watchedAt: new Date() },
            { new: true }
        )
        
        res.status(200).json({
            message:" Watched video time updated successfully "
        })

        return 


    }

    // console.log("I am here after if statement")

    const createdWatchedHistory = await WatchHistory.create({
        user_Id: user_id,
        video_Id: video_id
    })

    if (!createdWatchedHistory) {
        throw new ApiError(503, "Watch history was not created")

    }

    return res.status(200).json(
        new ApiResponse(200, createdWatchedHistory, "Watched history created successfully")
    )

})


const getWatchHistory = asyncHandler(async (req, res) => {
    // const user_id = req.user._id
    

    const user_id = req.user._id

    const userHistory = await WatchHistory.aggregate(
      [
  {
    '$match': {
      'user_Id': user_id
    }
  }, {
    '$lookup': {
      'from': 'videos', 
      'localField': 'video_Id', 
      'foreignField': '_id', 
      'as': 'videoData'
    }
  }, {
    '$unwind': '$videoData'
  }, {
    '$lookup': {
      'from': 'users', 
      'localField': 'videoData.owner', 
      'foreignField': '_id', 
      'as': 'ownerData'
    }
  }, {
    '$unwind': '$ownerData'
  }, {
    '$sort': {
      'watchedAt': -1
    }
  }, {
    '$lookup': {
      'from': 'subscriptions', 
      'localField': 'videoData.owner', 
      'foreignField': 'channel', 
      'as': 'subresult'
    }
  }, {
    '$addFields': {
      'subscriberCount': {
        '$size': '$subresult'
      }
    }
  }, {
    '$project': {
      'video': {
        '_id': '$video_Id', 
        'videoFile': '$videoData.videoFile', 
        'thumbNail': '$videoData.thumbNail', 
        'title': '$videoData.title', 
        'description': '$videoData.description', 
        'duration': '$videoData.duration', 
        'views': '$videoData.views', 
        'likes': '$videoData.likes', 
        'subscriberCount': '$subscriberCount', 
        'owner': '$videoData.owner', 
        'createdAt': '$videoData.createdAt'
      }, 
      'user': {
        'avatar': '$ownerData.avatar', 
        'username': '$ownerData.username', 
        'fullName': '$ownerData.fullName', 
        'createdAt': '$ownerData.createdAt'
      }, 
      'day': {
        '$dateToString': {
          'format': '%Y-%m-%d', 
          'date': '$watchedAt'
        }
      }, 
      
    }
  }, {
    '$group': {
      '_id': '$day', 
      'videos': {
        '$push': {
          'video' : "$video",
          'user': "$user"
        }
      }
    }
  }, {
    '$sort': {
      '_id': -1
    }
  }
]




//    [
//   {
//     '$match': {
//       'user_Id': user_id
//     }
//   }, {
//     '$lookup': {
//       'from': 'videos', 
//       'localField': 'video_Id', 
//       'foreignField': '_id', 
//       'as': 'videoData'
//     }
//   }, {
//     '$unwind': '$videoData'
//   }, {
//     '$lookup': {
//       'from': 'users', 
//       'localField': 'videoData.owner', 
//       'foreignField': '_id', 
//       'as': 'ownerData'
//     }
//   }, {
//     '$unwind': '$ownerData'
//   }, {
//     '$sort': {
//       'watchedAt': -1
//     }
//   }, {
//     '$lookup': {
//       'from': 'subscriptions', 
//       'localField': 'videoData.owner', 
//       'foreignField': 'channel', 
//       'as': 'subresult'
//     }
//   }, {
//     '$addFields': {
//       'subscriberCount': {
//         '$size': '$subresult'
//       }
//     }
//   }, {
//     '$project': {
//       'video': {
//         '_id': '$video_Id', 
//         'videoFile': '$videoData.videoFile', 
//         'thumbNail': '$videoData.thumbNail', 
//         'title': '$videoData.title', 
//         'description': '$videoData.description', 
//         'duration': '$videoData.duration', 
//         'views': '$videoData.views', 
//         'likes': '$videoData.likes', 
//         'subscriberCount': '$subscriberCount', 
//         'owner': '$videoData.owner', 
//         'createdAt': '$videoData.createdAt'
//       }, 
//       'user': {
//         'avatar': '$ownerData.avatar', 
//         'username': '$ownerData.username', 
//         'fullName': '$ownerData.fullName', 
//         'createdAt': '$ownerData.createdAt'
//       }
//     }
//   }
// ]
)

    // console.log("This is userhistory", userHistory);

    return res.status(200).json(
        new ApiResponse(200, userHistory, "fetched history successfully")
    )







})


export {
    addVideoInWatchHistory,
    getWatchHistory
}