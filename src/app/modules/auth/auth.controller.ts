import { Request, RequestHandler, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { TLogin } from "./auth.interface";
import { authServices } from "./auth.service";
import httpStatus from "http-status";
import sendResponse from "../../utils/sendResponse";

const isProd = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: (isProd ? "none" : "lax") as "none" | "lax",
};

const UserLogin: RequestHandler = catchAsync(async (req, res) => {
  const user: TLogin = req.body;
  const { accessToken, refreshToken } = await authServices.login(user);
  res.cookie("accessToken", accessToken, cookieOptions);
  res.cookie("refreshToken", refreshToken, cookieOptions);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User logged in successfully",
    data: accessToken,
  });
});

const userLogout: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User logged out successfully",
      data: null,
    });
  },
);

const refreshToken: RequestHandler = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;
  const { accessToken } = await authServices.RefreshToken(refreshToken);
  res.cookie("accessToken", accessToken, cookieOptions);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User access token fetched successfully",
    data: accessToken,
  });
});

const changePassword: RequestHandler = catchAsync(async (req, res) => {
  const password = req.body;
  const result = await authServices.ChangePassword(req.user, password);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Password changed successfully",
    data: result,
  });
});

// const forgotPassword: RequestHandler = catchAsync(async (req, res) => {
//   await authServices.forgotPassword(req.body.email);
//   sendResponse(res, {
//     success: true,
//     statusCode: httpStatus.OK,
//     message: "If that email is registered, a reset link has been sent.",
//     data: null,
//   });
// });

const resetPassword: RequestHandler = catchAsync(async (req, res) => {
  await authServices.resetPassword(req.body.token, req.body.newPassword);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Password reset successfully",
    data: null,
  });
});

export const authController = {
  UserLogin,
  userLogout,
  refreshToken,
  changePassword,
  // forgotPassword,
  resetPassword,
};
