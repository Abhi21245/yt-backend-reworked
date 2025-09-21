import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadCloudinary } from "../utils/cloudinary.js"
import { Video } from "../models/video.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Like } from "../models/like.modle.js"
import { Comment } from "../models/comment.modle.js"




const storeVideo = asyncHandler(async (req, res) => {

    const { title, description } = req.body

    const user_id = req.user._id

    const videoBuffer = req.files.video[0]

    // const buffers = req.files
    // console.log("This is buffer",buffers);


    if (!videoBuffer) {
        throw new ApiError(500, "Video is required ")
    }

    const uservideo = await uploadCloudinary(videoBuffer.buffer)

    if (!uservideo) {
        throw new ApiError(500, "Error while uploading ")
    }

    console.log("This is video url is ", uservideo)


    const thumbNailBuffer = req.files.thumbNail[0]

    if (!thumbNailBuffer) {
        throw new ApiError(500, "Thumbnail is required ")
    }

    const thumbNail = await uploadCloudinary(thumbNailBuffer.buffer)

    if (!thumbNail) {
        throw new ApiError(500, "Error while uploading ")
    }

    console.log("This is thumbnai url is ", thumbNail)

    const video = await Video.create({
        videoFile: uservideo.url,
        thumbNail: thumbNail.url,
        title: title,
        description: description,
        duration: Math.round(uservideo.duration),
        owner: user_id


    })


    if (!video) {
        throw new ApiError(500, "Error while saving video into database ")
    }

    return res.status(200).json(
        new ApiResponse(200, video, "Video uploaded")
    )


})



const getVideos = asyncHandler(async (req, res) => {



    const result = await Video.aggregate(
        [
            {
                '$sort': {
                    'createdAt': -1
                }
            }, {
                '$limit': 12
            }, {
                '$lookup': {
                    'from': 'users',
                    'localField': 'owner',
                    'foreignField': '_id',
                    'as': 'result'
                }
            }, {
                '$unwind': '$result'
            }, {
                '$lookup': {
                    'from': 'subscriptions',
                    'localField': 'owner',
                    'foreignField': 'channel',
                    'as': 'subscriberresult'
                }
            }, {
                '$addFields': {
                    'subscriberCount': {
                        '$size': '$subscriberresult'
                    }
                }
            }, {
                '$project': {
                    'video': {
                        '_id': '$_id',
                        'views': '$views',
                        'title': '$title',
                        'description': '$description',
                        'videoFile': '$videoFile',
                        'duration': '$duration',
                        'isPublish': '$isPublish',
                        'likes': '$likes',
                        'thumbNail': '$thumbNail',
                        'createdAt': '$createdAt',
                        'owner': '$owner',
                        'subscriberCount': '$subscriberCount'
                    },
                    'user': {
                        'username': '$result.username',
                        'avatar': '$result.avatar',
                        'fullName': '$result.fullName',
                        'ownerCreatedAt': '$result.createdAt'
                    }
                }
            }
        ]
    )


    // console.log("This is result ", result)



    return res.status(201).json(
        new ApiResponse(200, result, "Videos fetch successfully")
    )


})


const addView = asyncHandler(async (req, res) => {

    // console.log("this is req",req.body._id)
    const video_id = req.body._id
    //    console.log("this is video id ",video_id)
    //    console.log("this is video body",req.body)

    if (!video_id) {
        throw new ApiError(404, "Video id is required")
    }

    await Video.updateOne(
        {
            _id: (video_id)
        },
        {
            $inc: { views: 1 }
        }
    )

    return res.status(200).json(
        new ApiResponse(200, "The view is updated successfully")
    )


})


const addLike = asyncHandler(async (req, res) => {

    // console.log(req.body)
    // console.log(req.user)

    const video_id = req.body._id
    // const user_id = req.body.user_id
    const user_id = req.user._id

    if (!video_id && !user_id) {
        throw new ApiError(402, "Both id's are required ")
    }


    const exestingLike = await Like.findOne(
        {
            video_id,
            user_id
        }
    )

    // console.log("The exestiing like ",exestingLike)

    if (exestingLike) {
        throw new ApiError(403, "Like already exist")
    }

    await Like.create({
        video_id,
        user_id
    })

    await Video.updateOne(
        {
            _id: (video_id)
        },
        {
            $inc: { likes: 1 }
        }
    )


    return res.json(
        new ApiResponse(200, "Like document created and like is increased")
    )


})

const removeLike = asyncHandler(async (req, res) => {

    const user_id = req.user._id

    // console.log(req.body)
    // const user_id = req.body.user_id
    const video_id = req.body._id


    if (!video_id && !user_id) {
        throw new ApiError(402, "Both id's are required ")
    }


    const deletedLike = await Like.deleteOne({
        video_id,
        user_id
    })

    // console.log("THe deleted like",deletedLike)

    if (deletedLike.deletedCount === 0) {
        throw new ApiError(404, "Like not found")
    }


    await Video.updateOne(
        {
            _id: video_id,

        },
        {

            $inc: { likes: -1 }

        }
    )

    return res.json(
        new ApiResponse(200, "Like removed successfully ")
    )



})


const checkLiked = asyncHandler(async (req, res) => {



    const video_id = req.body._id
    const user_id = req.user._id



    const result = await Like.findOne({
        video_id,
        user_id
    })

    // console.log("This is result ", result)


    return res.json(
        new ApiResponse(200, result, "liked checked success")
    )




})


const addComment = asyncHandler(async (req, res) => {

    // user_id = req.user
    const user_id = req.body.user_id
    const video_id = req.body.video_id
    const comment = req.body.comment


    console.log("userid", user_id);
    console.log("video id", video_id);


    if (!user_id && !video_id && !comment) {
        throw new ApiError(404, "All fields are required")
    }

    const savedComment = await Comment.create({
        user_Id: user_id,
        video_Id: video_id,
        comment
    })


    if (!savedComment) {
        throw new ApiError(504, "Comment not saved")

    }

    return res.json(
        new ApiResponse(200, "comment saved successfuly")
    )




})


const deleteComment = asyncHandler(async (req, res) => {

    const user_id = req.body.user_id
    const video_id = req.body.video_id
    const comment_id = req.body.comment_id

    // console.log(user_id,video_id,comment_id);

    if (!user_id || !video_id || !comment_id) {
        throw new ApiError(402, "All fields are required")
    }



    const result = await Comment.deleteOne({
        user_Id: user_id,
        video_Id: video_id,
        _id: (comment_id)

    })


    if (result.deletedCount === 0) {
        throw new ApiError(503, "No comment found ")
    }

    return res.json(
        new ApiResponse(200, "Comment deleted successfully ")
    )




})




export {
    storeVideo,
    getVideos,
    addView,
    addLike,
    removeLike,
    addComment,
    deleteComment,
    checkLiked
}















// This is buffer

// [Object: null prototype] {
//   video: [
//     {
//       fieldname: 'video',
//       originalname: 'document_6334567803680462211.mp4',
//       encoding: '7bit',
//       mimetype: 'video/mp4',
//       buffer: <Buffer 00 00 00 20 66 74 79 70 69 73 6f 6d 00 00 02 00 69 73 6f 6d 69 73 6f 32 61 76 63 31 6d 70 34 31 00 c3 a2 29 6d 64 61 74 00 00 00 00 00 00 00 00 00 01 ... 12848678 more bytes>,
//       size: 12848728
//     }
//   ],
//   thumbNail: [
//     {
//       fieldname: 'thumbNail',
//       originalname: 'OG_NFT.png',
//       encoding: '7bit',
//       mimetype: 'image/png',
//       buffer: <Buffer 89 50 4e 47 0d 0a 1a 0a 00 00 00 0d 49 48 44 52 00 00 06 40 00 00 06 3d 08 06 00 00 00 96 b0 90 b8 00 00 00 01 73 52 47 42 00 ae ce 1c e9 00 00 20 00 ... 3089848 more bytes>,
//       size: 3089898
//     }
//   ]
// }