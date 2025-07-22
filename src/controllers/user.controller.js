import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"




const generateAccessTokenAndgenerateRefreshToken = async (userID) => {
    try {

        const user = await User.findById(userID)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()


        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")

    }
}



const registerUser = asyncHandler(async (req, res) => {
    //take data from frontend 
    // validation or regittration 
    //check user already exits 
    // check for image or avatar
    // upload them to cloudinary ,avatar
    //create user obj create enrty on database
    // remove password and refresh token field from response
    // check for user creation 
    // return response 

    console.log("The data is ",req.body);
    
    const { username, fullName, email, password } = req.body

    


    //     if([fullName,email,password,username].some((field)=> !field || field?.trim() === "" )  )
    // {
    //     throw new ApiError(400,"fullname is required")
    // }

    if (fullName === "" || !fullName) {
        throw new ApiError(400, "fullname is required")
    }
    if (username === "" || !username) {
        throw new ApiError(400, "username is required")
    }
    if (email === "" || !email) {
        throw new ApiError(400, "email is required")
    }
    if (password === "" || !password) {
        throw new ApiError(400, "password is required")
    }


    const existUser = await User.findOne(
        {
            $or: [{ username }, { email }]
        }
    )

    if (existUser) {
        throw new ApiError(409, "User with username and email already exist")
    }

    if(!req.files || !req.files.avatar || req.files.avatar.length === 0){
        throw new ApiError(400,"Avatar file is required");
    }

    const avatarBuffer = req.files.avatar[0].buffer
    
    // console.log("This is avatarbuffer",avatarBuffer)
    
    const avatar = await uploadCloudinary(avatarBuffer)
    console.log("This is avatar",avatar)
    
    // const avatarLocalPath = req.files?.avatar[0]?.path;
    // what is the path here ? is it from where it send 


    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    //why the previous checker not work ?


    // if (!avatarLocalPath) {
    //     throw new ApiError(400, "Avatar file is required")

    // }

    // const avatar = await uploadCloudinary(req.files.buffer)

    let coverImage = ""

    if (coverImageLocalPath) {

        coverImage = await uploadCloudinary(coverImageLocalPath)
    }


    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")

    }

    

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registring a user")
    }


    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registred ")
    )


})

const loginUser = asyncHandler(async (req, res) => {
    //req body -> data
    //username or email 
    //find user or email
    //validate password
    //access and refresh token
    //send cookies 

    // const { username, email, password } = req.body
    const { username, email, password } = req.body
    // console.log(req.body)

    if (!username && !email) {
        throw new ApiError(400, "Username or email is required")
    }

    // if (!username || !email) {
    //     throw new ApiError (400,"Username or email is required")
    // }

    //main logic

    const user = await User.findOne(
        {
            $or: [{ username }, { email }]
        }
    )
    //  console.log(user)
    //  console.dir(user, { showHidden: true, depth: null });
    //  console.log(user.toObject());


    if (!user) {
        throw new ApiError(402, "User does not exist ")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    //true or flase


    if (!isPasswordValid) {
        throw new ApiError(404, "Password is incorrect ")
    }

    const { accessToken, refreshToken } = await generateAccessTokenAndgenerateRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200, {
                user: loggedInUser, accessToken, refreshToken
            },
                "User logged In Successfully "
            )
        )



})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id,

        {
            $set: {
                refreshToken: undefined
            }
        }, {
        new: true
    }
    )


    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logout successfully"))

})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(406, "Unauthorized refresh token ")
    }

    const decodedToken = jwt.verify(incomingRefreshToken, REFRESH_TOKEN_SECRET)


    const user = await User.findById(decodedToken?._id)


    if (!user) {
        throw new ApiError(406, "Invalid refresh token ")
    }

    if (incomingAccessToken !== user?.refreshToken) {
        throw new ApiError(401, "Refresh token  is expired or used ")
    }


    const { accessToken, newrefreshToken } = await generateAccessTokenAndgenerateRefreshToken(user._id)

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newrefreshToken, options)
        .json(
            new ApiResponse(
                200,
                { accessToken, newrefreshToken },
                "Access token refreshed"
            )

        )

})

const changeCurrentPassword = asyncHandler(async (req, res) => {

    const { oldPassword, newPassword } = req.body

    if (!oldPassword) {
        throw new ApiError(400, "old password required")
    }
    if (!newPassword) {
        throw new ApiError(400, "new password required")
    }

    const user = await User.findById(req.user?._id)

    // console.log(user);
    // console.log("this is body ",req.body);
    

    const isOldPasswordValid = await user.isPasswordCorrect(oldPassword)

    if (!isOldPasswordValid) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    const updateduser = await user.save({validateBeforeSave:false})


    console.log("This is final updated ", updateduser);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Password changes successfully"
            )

        )


})

const getCurrentUser = asyncHandler(async (req,res)=>{

return res.status(200).json({
  success: true,
  message: "Current user fetched",
  user: req.user
});


})

const updateAccountDetails = asyncHandler(async (req,res)=>{

    const {fullName,email} = req.body

    if (!fullName && !email) {
        throw new ApiError (403,"Fullname and email required")
    }


   const user = await User.findByIdAndUpdate(req.user._id,
        {
            $set:{
                fullName:fullName,
                email:email
            }
        },{
            new:true

        }
).select("-password")



return res
.status(200)
.json(new ApiResponse(200,user,"Account details updated"))

})

const updateUserAvatar = asyncHandler(async (req,res)=>{

    const user = await User.findById(req.user._id)

    console.log("OG data ",user.avatar)
    
    const avatarLocalPath = req.file.path
    
    const avatar = await uploadCloudinary(avatarLocalPath)
    
    
    user.avatar = avatar
    await user.save({validateBeforeSave:false})

    
    console.log("\n\n\n new data ",user.avatar)
//  console.log(req.file)
//check once if it working or not 
 return res.status(200)
})


const getUserChannelProfile = asyncHandler(async (req,res)=>{
    
    const {username} = req.params

    if(!username){
        throw new ApiError (400,"Username is missing")
    }

   const channel = User.aggregate([
    
        {
            $match:{
                username: username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from: "subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from: "subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }
        },
        {
            $addFields:{
                subscribersCount:{
                    $size: $subscribers
                },
                channelsSubscribedToCount:{
                     $size: $subscribedTo
                },isSubscribed:{
                    $cond:{
                        if:{$in : [req.user?._id,"$subscribers.subscriber"]},
                        then:true,
                        else:false
                    }
                }
            }
        },
        {
         
            $project:{
                fullName:1,
                username:1,
                subscribersCount:1,
                channelsSubscribedToCount:1,
                isSubscribed:1,
                avatar:1,
                coverImage:1,
                email:1,
            }    
            
        }


    ])

    if (!channel?.length) {
        throw new ApiError (404,"channel does not exists")
        
    }


    return res 
    .status(200)
    .json(
        new ApiResponse (200,channel[0],"User channel fetched successfully")
    )


})





export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar
}



// I am registeruser (req,res,next)=>{
//         Promise.resolve(requestHandler(req,res,next)).catch((err)=> next(err))
//     }



