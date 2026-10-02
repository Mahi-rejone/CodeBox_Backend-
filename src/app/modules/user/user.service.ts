import httpStatus from "http-status";
import bcrypt from "bcrypt";
import AppError from "../../error/AppError";
import { prisma } from "../../DB/prisma";
import { config } from "../../config/config";
import { Prisma, UserRole, UserStatus } from "../../../generated/client";
import { sendVerificationEmail } from "../../utils/sendVarificationEmail";
import { TCreateUserPayload, TUserFilters } from "./user.types";

const isUserExist = async (email: string) => {
  return await prisma.user.findUnique({ where: { email } });
};

const isPasswordMatched = async (plainText: string, hashedPass: string) => {
  return bcrypt.compare(plainText, hashedPass);
};

const createUserIntoDB = async (
  payload: TCreateUserPayload,
  createdByAdmin = false,
) => {
  const existingUserByEmail = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUserByEmail && existingUserByEmail.isVerified) {
    throw new AppError(httpStatus.CONFLICT, "email already exists!");
  }

  const existingUserByUsername = await prisma.user.findUnique({
    where: { username: payload.username },
  });

  if (
    existingUserByUsername &&
    existingUserByUsername.email !== payload.email
  ) {
    throw new AppError(httpStatus.CONFLICT, "username already exists!");
  }

  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.salt_rounds),
  );

  const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
  const verifyCodeExpiry = new Date(Date.now() + 3600000); // 1 hour

  let result;

  if (existingUserByEmail) {
    const { profile, ...rest } = payload;
    rest.password = hashedPassword;

    result = await prisma.$transaction(async (tx) => {
      if (profile) {
        profile.dateOfBirth = new Date(profile.dateOfBirth);
        await tx.userProfile.update({
          where: { id: existingUserByEmail.profileId! },
          data: profile,
        });
      }

      const updatedUser = await tx.user.update({
        where: { id: existingUserByEmail.id },
        data: {
          ...rest,
          isVerified: createdByAdmin,
          verifyCode: createdByAdmin ? null : verifyCode,
          verifyCodeExpiry: createdByAdmin ? null : verifyCodeExpiry,
        },
        omit: { passwordHash: true },
      });

      return updatedUser;
    });
  } else {
    const { profile, ...rest } = payload;
    rest.password = hashedPassword;
    profile!.dateOfBirth = new Date(profile!.dateOfBirth);

    result = await prisma.$transaction(async (tx) => {
      const createProfile = await tx.userProfile.create({ data: profile! });
      if (!createProfile) {
        throw new AppError(httpStatus.FORBIDDEN, "failed to create user!");
      }

      const user = await tx.user.create({
        data: {
          profileId: createProfile.id,
          ...rest,
          isVerified: createdByAdmin,
          verifyCode: createdByAdmin ? null : verifyCode,
          verifyCodeExpiry: createdByAdmin ? null : verifyCodeExpiry,
        },
        omit: { passwordHash: true },
      });
      if (!user) {
        throw new AppError(httpStatus.FORBIDDEN, "failed to create user!");
      }

      return user;
    });
  }

  if (!createdByAdmin) {
    const emailResponse = await sendVerificationEmail({
      email: result.email,
      username: result.username,
      otp: verifyCode,
    });

    if (!emailResponse.success) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        emailResponse.message,
      );
    }
  }

  return result;
};

const getMe = async (id: string) => {
  const result = await prisma.user.findUnique({
    where: { id },
    omit: { passwordHash: true },
    include: { profile: true },
  });
  return result;
};

const verifyUserIntoDB = async (payload: {
  email: string;
  verifyCode: string;
}) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.isVerified) {
    throw new AppError(httpStatus.BAD_REQUEST, "User is already verified");
  }

  const isCodeValid = user.verifyCode === payload.verifyCode;
  const isCodeNotExpired =
    user.verifyCodeExpiry && new Date(user.verifyCodeExpiry) > new Date();

  if (!isCodeValid) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid verification code");
  }

  if (!isCodeNotExpired) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Verification code has expired. Please request a new one.",
    );
  }

  const result = await prisma.user.update({
    where: { email: payload.email },
    data: {
      isVerified: true,
      verifyCode: null,
      verifyCodeExpiry: null,
    },
    omit: { passwordHash: true },
  });

  return result;
};

const updateMyProfile = async (
  userId: string,
  payload: {
    currentPassword: string;
    status?: UserStatus;
    phoneNumber?: string;
    state?: string;
    district?: string;
    town?: string;
    address?: string;
    img?: string;
  },
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      profile: true,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // Verify current password
  if (!user.passwordHash) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This account does not have a password",
    );
  }

  const passwordMatched = await isPasswordMatched(
    payload.currentPassword,
    user.passwordHash,
  );

  if (!passwordMatched) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Current password is incorrect",
    );
  }

  const {
    currentPassword,
    status,
    phoneNumber,
    state,
    district,
    town,
    address,
    img,
  } = payload;

  void currentPassword;

  const userUpdateData: Prisma.UserUpdateInput = {};
  const profileUpdateData: Prisma.UserProfileUpdateInput = {};

  // User fields
  if (status !== undefined) {
    userUpdateData.status = status;
  }

  // Profile fields
  if (phoneNumber !== undefined) {
    profileUpdateData.phoneNumber = phoneNumber;
  }

  if (state !== undefined) {
    profileUpdateData.state = state;
  }

  if (district !== undefined) {
    profileUpdateData.district = district;
  }

  if (town !== undefined) {
    profileUpdateData.town = town;
  }

  if (address !== undefined) {
    profileUpdateData.address = address || null;
  }

  if (img !== undefined) {
    profileUpdateData.img = img || null;
  }

  const result = await prisma.$transaction(async (tx) => {
    if (Object.keys(userUpdateData).length > 0) {
      await tx.user.update({
        where: {
          id: userId,
        },
        data: userUpdateData,
      });
    }

    if (user.profileId && Object.keys(profileUpdateData).length > 0) {
      await tx.userProfile.update({
        where: {
          id: user.profileId,
        },
        data: profileUpdateData,
      });
    }

    return tx.user.findUnique({
      where: {
        id: userId,
      },
      omit: {
        passwordHash: true,
      },
      include: {
        profile: true,
      },
    });
  });

  return result;
};

const updateUserByAdmin = async (
  userId: string,
  payload: {
    status?: UserStatus;
    isVerified?: boolean;
  },
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  const result = await prisma.user.update({
    where: {
      id: userId,
    },
    data: payload,
    omit: {
      passwordHash: true,
    },
  });

  return result;
};

const resendVerificationCodeIntoDB = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.isVerified) {
    throw new AppError(httpStatus.BAD_REQUEST, "User is already verified");
  }

  const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
  const verifyCodeExpiry = new Date(Date.now() + 3600000);

  const result = await prisma.user.update({
    where: { email },
    data: {
      verifyCode,
      verifyCodeExpiry,
    },
    omit: { passwordHash: true },
  });

  const emailResponse = await sendVerificationEmail({
    email: result.email,
    username: result.username,
    otp: verifyCode,
  });

  if (!emailResponse.success) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, emailResponse.message);
  }

  return result;
};

const getAllUsersFromDB = async () => {
  const result = await prisma.user.findMany({
    where: { isDeleted: false },
    omit: { passwordHash: true },
    include: { profile: true },
    orderBy: { createdAt: "desc" },
  });
  return result;
};

const getAllUser = async (filters: TUserFilters) => {
  const { state, district, town, search } = filters;

  const result = await prisma.user.findMany({
    where: {
      role: UserRole.USER,
      isDeleted: false,
      status: UserStatus.ACTIVE,

      profile: {
        is: {
          ...(state && {
            state: {
              contains: state,
              mode: "insensitive",
            },
          }),

          ...(district && {
            district: {
              contains: district,
              mode: "insensitive",
            },
          }),

          ...(town && {
            town: {
              contains: town,
              mode: "insensitive",
            },
          }),
        },
      },

      ...(search && {
        OR: [
          {
            fullName: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            username: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            profile: {
              is: {
                state: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            },
          },
          {
            profile: {
              is: {
                district: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            },
          },
          {
            profile: {
              is: {
                town: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            },
          },
        ],
      }),
    },

    omit: {
      passwordHash: true,
    },

    include: {
      profile: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
};

const getUserById = async (id: string) => {
  const result = await prisma.user.findFirst({
    where: { id, role: "USER", isDeleted: false, status: "ACTIVE" },
    omit: { passwordHash: true },
    include: { profile: true },
  });
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  return { ...result, profile: result.profile || null };
};

const getSingleUserFromDB = async (id: string) => {
  const result = await prisma.user.findFirst({
    where: { id, isDeleted: false },
    omit: { passwordHash: true },
    include: { profile: true },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  return result;
};

const deleteUserFromDB = async (id: string) => {
  const user = await prisma.user.findFirst({
    where: { id },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const result = await prisma.$transaction(async (tx) => {
    const deletedUser = await tx.user.delete({
      where: { id },
      omit: { passwordHash: true },
    });

    if (user.profileId) {
      await tx.userProfile.delete({
        where: { id: user.profileId },
      });
    }

    return deletedUser;
  });

  return result;
};

export const userServices = {
  isUserExist,
  isPasswordMatched,
  createUserIntoDB,
  getMe,
  updateMyProfile,
  updateUserByAdmin,
  verifyUserIntoDB,
  resendVerificationCodeIntoDB,
  getAllUsersFromDB,
  getAllUser,
  getUserById,
  getSingleUserFromDB,
  deleteUserFromDB,
};
