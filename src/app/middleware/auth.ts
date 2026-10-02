import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../error/AppError.js";
import { verifyToken } from "../utils/auth.utils";
import { config } from "../config/config.js";
import { prisma } from "../DB/prisma.js";
import { UserRole, UserStatus } from "../../generated/enums.js";

const auth = (...allowedRoles: UserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken;
    if (!token) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "You do not have the necessary permissions to access this resource.",
      );
    }

    let decoded: JwtPayload;
    try {
      decoded = verifyToken(token, config.access_token_secret as string);
    } catch (err) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "You do not have the necessary permissions to access this resource.",
      );  
    }

    const { id, role, email } = decoded;

    const user = await prisma.user.findUnique({ where: { id, email, role } });
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found!");
    }
    if (user.isDeleted) {
      throw new AppError(httpStatus.FORBIDDEN, "This user is Deleted!");
    }
    if (user.status !== UserStatus.ACTIVE) {
      throw new AppError(httpStatus.FORBIDDEN, "This user is Blocked!");
    }
    if (email !== user.email) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "You do not have the necessary permissions to access this resource.",
      );
    }

    if (allowedRoles.length && !allowedRoles.includes(role)) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "You do not have the necessary permissions to access this resource.",
      );
    }

    req.user = decoded;
    next();
  });
};

export default auth;
