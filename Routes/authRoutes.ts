
import {Router} from "express";
const router=Router();
import {GetUserDetials, Signin, Signup} from "../Controllers/authController";
import { authenticateToken } from "../utils/userAuthMiddleware";
router.route("/signup")
    .post(Signup)

router.route("/signin")
    .post(Signin)
    
router.route("/accountdetails/:userId")
    .get(authenticateToken,GetUserDetials)

export default router;