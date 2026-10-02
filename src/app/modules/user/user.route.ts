import express from "express";
import { userController } from "./user.controller";
import { validation } from "../../middleware/validation";
import { userValidation } from "./user.validation";
import auth from "../../middleware/auth";
import { UserRole } from "../../../generated/enums";
import { resendVerificationLimiter } from "../../middleware/rateLimiter";

const router = express.Router();
router.post(
  "/create-user",
  validation(userValidation.userValidationSchema),
  userController.createUser,
);

router.post(
  "/admin-create-user",
  auth(UserRole.ADMIN),
  validation(userValidation.userValidationSchema),
  userController.adminCreateUser,
);

router.post(
  "/verify",
  validation(userValidation.verifyUserValidationSchema),
  userController.verifyUser,
);

router.post(
  "/resend-verification",
  resendVerificationLimiter,
  validation(userValidation.resendVerificationCodeValidationSchema),
  userController.resendVerificationCode,
);

router.get(
  "/get-me",
  auth(
    UserRole.ADMIN,
    UserRole.USER,
  ),
  userController.getMe,
);

router.patch(
  "/update-profile",
  auth(
    UserRole.ADMIN,
    UserRole.USER,
  ),
  validation(userValidation.updateMyProfileValidation),
  userController.updateMyProfile,
);

router.get("/get-all-users", auth(UserRole.ADMIN), userController.getAllUsers);

router.get("/user", userController.getAllUsers);

router.get("/:id", auth(UserRole.ADMIN), userController.getSingleUser);

router.delete("/:id", auth(UserRole.ADMIN), userController.deleteUser);

router.patch(
  "/:id/admin-update",
  auth(UserRole.ADMIN),
  validation(userValidation.updateUserByAdminSchema),
  userController.updateUserByAdmin,
);
export const userRoute = router;
