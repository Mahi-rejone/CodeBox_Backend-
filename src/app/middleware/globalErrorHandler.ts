/* eslint-disable @typescript-eslint/no-unused-vars */
import { ErrorRequestHandler } from "express";
import httpStatus from "http-status";
import { ZodError } from "zod";
import AppError from "../error/AppError";
import { Prisma } from "../../generated/client";

export const globalErrorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  next,
) => {
   console.error(err);
  let statusCode = 500;
  let message = "something went wrong";
  let errorMessage = err?.message;
  let errorDetails = err;

  if (err instanceof ZodError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Zod Error";
    errorMessage = `${err?.issues?.map((errData) => errData.message)}`;
    errorMessage = errorMessage.split(",").join(". ");
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = httpStatus.BAD_REQUEST;
      message = "Duplicate Entry";
      errorMessage = `${(err.meta?.target as string[])?.join(", ")} already exists!`;
    }
    if (err.code === "P2025") {
      statusCode = httpStatus.NOT_FOUND;
      message = "Not Found";
      errorMessage = `${err.meta?.cause || "Requested record does not exist"}`;
    }
    if (err.code === "P2003") {
      statusCode = httpStatus.BAD_REQUEST;
      message = "Invalid Reference";
      errorMessage = `Foreign key constraint failed on field: ${err.meta?.field_name}`;
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Invalid Data";
    errorMessage = "One or more fields are missing or of the wrong type";
  }

  if (err instanceof AppError) {
    statusCode = err?.statusCode;
    message = "App Error";
    errorMessage = err?.message;
    if (err.statusCode === httpStatus.UNAUTHORIZED) {
      statusCode = err?.statusCode;
      message = "Unauthorized Access";
      errorMessage = err?.message;
      errorDetails = null;
    }
  }

  return res.status(statusCode as number).json({
    success: false,
    message,
    errorMessage,
    errorDetails,
  });
};
