import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"


export const verifyJWT = asyncHandler(async (req, _,next)=>{
   try {

     // console.log("THis are all cookies ",req.cookies);
     // console.log("This is access token  ",req.cookies.accessToken);
     
     const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
 
     if(!token){
        throw new ApiError(401,"Unauthorized request")
     }
 
     const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
 
     const user = await User.findById(decodedToken._id).select("-password -refreshToken")
     // check in the user the password removal is not require as it didnt hold pass
 
     if(!user){
        throw new ApiError(401,"Invalid Access Token")
     }
 
     req.user = user;
     next()
   } catch (error) {
    throw new ApiError(401,error?.message || "Invalid access token ")
    
   }


})

