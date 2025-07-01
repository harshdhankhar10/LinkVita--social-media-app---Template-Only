import express from "express";
const router = express.Router();

import {requireSignIn} from "../middleware/authMiddleware.js";
import {registerUser, loginUser, getUserDetails, followUser, unfollowUser} from "../controllers/userController.js";

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/follow", requireSignIn, followUser);
router.post("/unfollow", requireSignIn, unfollowUser);
router.get("/user/:userName",getUserDetails);

router.get('/user-auth', requireSignIn, (req, res) => {
    res.status(200).send({ ok: true, message: "User Authentication Successful" });
});



export default router;