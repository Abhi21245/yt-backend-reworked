import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { refreshAccessToken, loginUser, logoutUser, registerUser, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar } from "../controllers/user.controller.js";
import { storeVideo } from "../controllers/video.controller.js"


const router = Router()

router.route("/register").post(
    upload.fields(
        [
            {
                name: "avatar",
                maxCount: 1
            },

            {
                name: "coverImage",
                maxCount: 1
            }
        ]
    ),
    registerUser)

router.route("/login").post(loginUser)

router.route("/updateavatar").post(verifyJWT,upload.single("avatar"),updateUserAvatar)

//secured routes

router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT,changeCurrentPassword)
router.route("/getcurrent-user").post(verifyJWT,getCurrentUser)
router.route("/updatedetails").post(verifyJWT,updateAccountDetails)
router.route("/storevideo").post(
    verifyJWT,
    upload.fields([
        {name:'video',maxCount:1},
        {name:'thumbNail',maxCount:1}
    ]),
    storeVideo)





export default router 