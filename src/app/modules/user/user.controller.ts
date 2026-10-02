import { RequestHandler } from "express";
import catchAsync from "../../utils/catchAsync.js";
import { userServices } from "./user.service.js";
import httpStatus from "http-status";
import sendResponse from "../../utils/sendResponse.js";

const createUser: RequestHandler = catchAsync(async (req, res) => {
  try {
    const data = req.body;
    const result = await userServices.createUserIntoDB(data);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "User successfully created",
      data: result,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    sendResponse(res, {
      success: false,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: "Failed to create user",
      data: null,
    });
  }
});

// user.controller.ts
const adminCreateUser: RequestHandler = catchAsync(async (req, res) => {
  const result = await userServices.createUserIntoDB(req.body, true);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "User successfully created",
    data: result,
  });
});

const getMe: RequestHandler = catchAsync(async (req, res) => {
  const data = req.user;
  const result = await userServices.getMe(data.id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User retrieved successfully",
    data: result,
  });
});

const updateMyProfile: RequestHandler = catchAsync(async (req, res) => {
  const userId = req.user.id;

  const result = await userServices.updateMyProfile(userId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Profile updated successfully",
    data: result,
  });
});

const updateUserByAdmin: RequestHandler = catchAsync(async (req, res) => {
  const result = await userServices.updateUserByAdmin(
    req.params.id as string,
    req.body,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User updated successfully",
    data: result,
  });
});

const verifyUser: RequestHandler = catchAsync(async (req, res) => {
  const result = await userServices.verifyUserIntoDB(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Account verified successfully",
    data: result,
  });
});

const resendVerificationCode: RequestHandler = catchAsync(async (req, res) => {
  const { email } = req.body;
  const result = await userServices.resendVerificationCodeIntoDB(email);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Verification code resent successfully",
    data: result,
  });
});

const getAllUsers = catchAsync(async (req, res) => {
  const result = await userServices.getAllUsersFromDB();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Users retrieved successfully",
    data: result,
  });
});


const getSingleUser = catchAsync(async (req, res) => {
  const result = await userServices.getSingleUserFromDB(
    req.params.id as string,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User retrieved successfully",
    data: result,
  });
});

const deleteUser = catchAsync(async (req, res) => {
  const result = await userServices.deleteUserFromDB(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User deleted successfully",
    data: result,
  });
});

export const userController = {
  createUser,
  adminCreateUser,
  getMe,
  updateMyProfile,
  updateUserByAdmin,
  verifyUser,
  resendVerificationCode,
  getAllUsers,
  getSingleUser,
  deleteUser,
};

