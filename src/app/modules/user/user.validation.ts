import { z } from "zod";
import { UserRole, UserStatus } from "../../../generated/enums";

const userValidationSchema = z.object({
  body: z.object({
    username: z.string().min(2).max(100),
    email: z.email({ message: "Invalid email" }),
    password: z.string().min(6).max(100),
    role: z.enum(UserRole),
    status: z.enum(UserStatus).default(UserStatus.ACTIVE),
  }),
});

const updateMyProfileValidation = z
  .object({
    body: z.object({
      currentPassword: z.string().min(1, "Current password is required"),

      status: z.enum(UserStatus).optional(),

      phoneNumber: z.string().min(1).max(30).optional(),

      guardianNumber: z.string().max(30).optional().or(z.literal("")),

      state: z.string().min(1).max(100).optional(),

      district: z.string().min(1).max(100).optional(),

      town: z.string().min(1).max(100).optional(),

      address: z.string().max(500).optional().or(z.literal("")),

      img: z
        .string()
        .url("Image must be a valid URL")
        .optional()
        .or(z.literal("")),
    }),
  })
  
  .refine(
    (data) => {
      const { currentPassword, ...updates } = data.body;

      return Object.keys(updates).length > 0;
    },
    {
      message: "At least one profile field must be provided",
      path: ["body"],
    },
  );

  const updateUserByAdminSchema = z.object({
    body: z.object({
      status: z.enum(["ACTIVE", "BLOCK"]).optional(),
      isVerified: z.boolean().optional(),
    }),
  });


const verifyUserValidationSchema = z.object({
  body: z.object({
    email: z.email({ message: "Invalid email" }),
    verifyCode: z.string().length(6, {
      message: "Code must be 6 digits",
    }),
  }),
});

const resendVerificationCodeValidationSchema = z.object({
  body: z.object({
    email: z.email({ message: "Invalid email" }),
  }),
});

export const userValidation = {
  userValidationSchema,
  updateMyProfileValidation,
  updateUserByAdminSchema,
  verifyUserValidationSchema,
  resendVerificationCodeValidationSchema,
};
