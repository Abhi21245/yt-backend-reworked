import { response } from "express";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const subscribeToChannel = asyncHandler(async (req, res) => {

    const owner_id = req.body.owner_id
    const user_id = req.user._id

    // console.log("This is owern_id",owner_id)
    // console.log("This is user_id",user_id)

    // const user_id = req.user._id

    if (!owner_id || !user_id) {
        throw new ApiError(400, "both id's are required")
    }

    const result = await Subscription.findOne({
        channel: owner_id,
        subscriber: user_id
    })

    if (result) {
        console.log("Already subscribed");
        res.json(
            new ApiResponse(200, "User already subscribed")
        )
        return

    }

    const resultDoc = await Subscription.create({
        subscriber: user_id,
        channel: owner_id
    })


    if (!resultDoc) {
        throw new ApiError(400, "Error while creating doc ")

    }

    return res.json(
        new ApiResponse(200, resultDoc, "User subscribed successfully")

    )

})

const unsubscribeToChannel = asyncHandler(async (req, res) => {

    const user_id = req.user._id
    const owner_id = req.body.owner_id

    if (!user_id || !owner_id) {
        throw new ApiError(400, "Both id's are required")
    }

    const result = await Subscription.findOneAndDelete({
        subscriber:user_id,
        channel:owner_id
    })

    if (result) {
        return res.json(
            new ApiResponse(200,"Channel unsubscribed")
        )
    }

    return res.json(
        new ApiResponse(200,"User not found ")
    )

    // console.log("This is result ", result);



    

    // if (result) {
    //     throw new ApiError(400,"")
    // }




})

const checkForSubscribe = asyncHandler ( async (req,res)=>{

    const user_id = req.user._id
    const owner_id = req.body.owner_id

    if (!user_id || !owner_id) {
        throw new ApiError(400, "Both id's are required")
    }

    const result = await Subscription.findOne({
        subscriber:user_id,
        channel:owner_id
    })

    return res.json(
            new ApiResponse(200,result,"User is subscribed")
        )


} )


export {
    subscribeToChannel,
    unsubscribeToChannel,
    checkForSubscribe
}