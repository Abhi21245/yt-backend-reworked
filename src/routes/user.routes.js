import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { refreshAccessToken, loginUser, logoutUser, registerUser, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar } from "../controllers/user.controller.js";
import { addComment, addLike, addView, checkLiked, deleteComment, getVideos, removeLike, storeVideo } from "../controllers/video.controller.js"
import { addVideoInWatchHistory, getWatchHistory } from "../controllers/watchHistory.controller.js";
import { checkForSubscribe, subscribeToChannel, unsubscribeToChannel } from "../controllers/subscription.controller.js";


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
router.route("/getvideos").post(verifyJWT,getVideos)
router.route("/get-watched-history").get(verifyJWT,getWatchHistory)
// router.route("/get-watched-history").post(verifyJWT,getWatchHistory)

router.route("/add-video-in-history").post(verifyJWT,addVideoInWatchHistory)
// router.route("/add-video-in-history").post(addVideoInWatchHistory)  

router.route("/updateview").post(addView)
router.route("/addlike").post(verifyJWT,addLike)
router.route("/removelike").post(verifyJWT,removeLike)
router.route("/checkliked").post(verifyJWT,checkLiked)

router.route("/addcomment").post(addComment)
router.route("/deletecomment").post(deleteComment)

router.route("/subscribe").post(verifyJWT,subscribeToChannel)
router.route("/unsubscribe").post(verifyJWT,unsubscribeToChannel)
router.route("/check-subscribe").post(verifyJWT,checkForSubscribe)



router.route("/storevideo").post(
    verifyJWT,
    upload.fields([
        {name:'video',maxCount:1},
        {name:'thumbNail',maxCount:1}
    ]),
    storeVideo)





export default router 