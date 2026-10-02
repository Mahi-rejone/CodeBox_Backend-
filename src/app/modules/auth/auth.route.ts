import express from "express";
import { validation } from "../../middleware/validation.js";
import { authValidation } from "./auth.validation.js";
import { authController } from "./auth.controller.js";
import auth from "../../middleware/auth.js";
import { UserRole } from "../../../generated/enums.js";

const router = express.Router();
router.post(
  "/login",
  validation(authValidation.authValidationSchema),
  authController.UserLogin,
);
router.post(
  "/logout",
  authController.userLogout,
);
router.post(
  "/refresh-token",
  validation(authValidation.refreshTokenValidationSchema),
  authController.refreshToken,
);
router.post(
  "/change-password",
  auth(
    UserRole.ADMIN,
    UserRole.USER,
  ),
  validation(authValidation.changePasswordValidationSchema),
  authController.changePassword,
);
// router.post(
//   "/forgot-password",
//   validation(authValidation.forgotPasswordValidationSchema),
//   authController.forgotPassword,
// );
router.post(
  "/reset-password",
  validation(authValidation.resetPasswordValidationSchema),
  authController.resetPassword,
);

export const authRoute = router;
