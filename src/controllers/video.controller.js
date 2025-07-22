import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadCloudinary } from "../utils/cloudinary.js"
import { Video } from "../models/video.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"



const storeVideo = asyncHandler( async (req,res)=>{

    const {title,description} = req.body

    const user_id =  req.user._id

    const videoBuffer = req.files.video[0]

    // const buffers = req.files
    // console.log("This is buffer",buffers);
    

    if(!videoBuffer){
        throw new ApiError(500,"Video is required ")
    }

    const uservideo = await uploadCloudinary(videoBuffer.buffer)

    if(!uservideo){
        throw new ApiError(500,"Error while uploading ")
    }

    console.log("This is video url is ",uservideo)

    
    const thumbNailBuffer = req.files.thumbNail[0]

    if(!thumbNailBuffer){
        throw new ApiError(500,"Thumbnail is required ")
    }

    const thumbNail = await uploadCloudinary(thumbNailBuffer.buffer)

      if(!thumbNail){
        throw new ApiError(500,"Error while uploading ")
    }

    console.log("This is thumbnai url is ",thumbNail)

    const video = await Video.create({
        videoFile: uservideo.url,
        thumbNail: thumbNail.url,
        title:title,
        description:description,
        duration: Math.round(uservideo.duration),
        owner: user_id


    })


    if(!video){
        throw new ApiError(500,"Error while saving video into database ")
    }

    return res.status(200).json(
        new ApiResponse(200,video,"Video uploaded")
    )


})

export{
    storeVideo
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