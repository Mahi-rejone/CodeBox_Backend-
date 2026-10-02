import httpStatus from "http-status";
import bcrypt from "bcrypt";
import ms from "ms";
import crypto from "crypto";

import AppError from "../../error/AppError.js";
import { JwtPayload } from "jsonwebtoken";
import { TLogin } from "./auth.interface.js";
import { prisma } from "../../DB/prisma.js";
import { config } from "../../config/config.js";
import { createToken, verifyToken } from "../../utils/auth.utils";
import { userServices } from "../user/user.service.js";
import { UserRole, UserStatus } from "../../../generated/enums.js";
import ResetPasswordEmail from "../../emails/ResetPasswordEmail";

const RESET_TOKEN_VALIDITY_MS = 60 * 60 * 1000;

const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

const login = async (payload: TLogin) => {
  const user = await userServices.isUserExist(payload.email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  if (user.status === UserStatus.BLOCK) {
    throw new AppError(httpStatus.BAD_REQUEST, "This user is blocked!");
  }

  if (user.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  if (!user.isVerified) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Please verify your email before logging in",
    );
  }

  if (!user.passwordHash) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "This account does not have a password",
    );
  }

  const passwordMatched = await userServices.isPasswordMatched(
    payload.password,
    user.passwordHash,
  );

  if (!passwordMatched) {
    throw new AppError(httpStatus.FORBIDDEN, "Password does not match!");
  }

  const jwtPayload: {
    id: string;
    role: UserRole;
    email: string;
    username: string;
  } = {
    id: user.id,
    role: user.role,
    username: user.username,
    email: user.email,
  };

  const accessToken = createToken(
    jwtPayload,
    config.access_token_secret as string,
    config.access_token_expiration as ms.StringValue,
  );

  const refreshToken = createToken(
    jwtPayload,
    config.refresh_token_secret as string,
    config.refresh_token_expiration as ms.StringValue,
  );

  return {
    accessToken,
    refreshToken,
  };
};

const RefreshToken = async (refreshToken: string) => {
  const decoded = verifyToken(
    refreshToken,
    config.refresh_token_secret as string,
  );

  const { id, email } = decoded;

  const user = await prisma.user.findFirst({
    where: {
      id: id as string,
      email: email as string,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  if (user.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, "This user is deleted!");
  }

  if (user.status !== UserStatus.ACTIVE) {
    throw new AppError(httpStatus.FORBIDDEN, "This user is blocked!");
  }

  const jwtPayload: {
    id: string;
    role: UserRole;
    email: string;
  } = {
    id: user.id,
    role: user.role,
    email: user.email,
  };

  const accessToken = createToken(
    jwtPayload,
    config.access_token_secret as string,
    config.access_token_expiration as ms.StringValue,
  );

  return {
    accessToken,
  };
};

const ChangePassword = async (
  userData: JwtPayload,
  password: {
    currentPassword: string;
    newPassword: string;
  },
) => {
  const user = await userServices.isUserExist(userData.email as string);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  if (!user.passwordHash) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This account does not have a password",
    );
  }

  const passwordMatched = await userServices.isPasswordMatched(
    password.currentPassword,
    user.passwordHash,
  );

  if (!passwordMatched) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Current password does not match!",
    );
  }

  const newHashedPassword = await bcrypt.hash(
    password.newPassword,
    Number(config.salt_rounds),
  );

  const result = await prisma.user.update({
    where: {
      id: userData.id as string,
    },
    data: {
      passwordHash: newHashedPassword,
      resetPasswordToken: null,
      resetPasswordExpiry: null,
    },
    omit: {
      passwordHash: true,
    },
  });

  return result.updatedAt;
};

// const forgotPassword = async (email: string) => {
//   const user = await userServices.isUserExist(email);

//   // Do not reveal whether an email exists.
//   if (!user) {
//     return null;
//   }

//   const rawToken = crypto.randomBytes(32).toString("hex");

//   await prisma.user.update({
//     where: {
//       id: user.id,
//     },
//     data: {
//       resetPasswordToken: hashToken(rawToken),
//       resetPasswordExpiry: new Date(
//         Date.now() + RESET_TOKEN_VALIDITY_MS,
//       ),
//     },
//   });

//   const resetLink =
//     `${config.origin}/reset-password?token=${encodeURIComponent(rawToken)}`;

//   await ResetPasswordEmail({
//     email: user.email,
//     username: user.fullName || user.username,
//     resetLink,
//   });

//   return null;
// };

const resetPassword = async (
  token: string,
  newPassword: string,
) => {
  const hashedIncomingToken = hashToken(token);

  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: hashedIncomingToken,
      resetPasswordExpiry: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This reset link is invalid or has expired.",
    );
  }

  const hashedPassword = await bcrypt.hash(
    newPassword,
    Number(config.salt_rounds),
  );

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      passwordHash: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpiry: null,
    },
  });

  return null;
};

export const authServices = {
  login,
  RefreshToken,
  ChangePassword,
  // forgotPassword,
  resetPassword,
};
