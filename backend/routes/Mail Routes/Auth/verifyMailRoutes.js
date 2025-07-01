import express from "express";
const router = express.Router();

import { sendVerificationEmail, verifyEmail } from "../../../controllers/Main Controllers/verifyMailController.js";

router.post("/send-verification-email", sendVerificationEmail);
router.post("/verify-email", verifyEmail);

export default router;