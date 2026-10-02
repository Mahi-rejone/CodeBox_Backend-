import { z } from "zod";

const authValidationSchema = z.object({
  body: z.object({
    email: z.string(),
    password: z.string(),
  }),
});

const refreshTokenValidationSchema = z.object({
  cookie: z.object({
    refreshToken: z.string(),
  }),
});

const changePasswordValidationSchema = z.object({
  body: z.object({
    currentPassword: z.string(),
    newPassword: z.string(),
  }),
});

const adminChangePasswordValidationSchema = z.object({
  body: z.object({
    email: z.string(),
    newPassword: z.string(),
  }),
});

// const forgotPasswordValidationSchema = z.object({
//   body: z.object({
//     email: z.string().email(),
//   }),
// });

const resetPasswordValidationSchema = z.object({
  body: z.object({
    token: z.string().min(1),
    newPassword: z.string().min(6),
  }),
});



export const authValidation = {
  authValidationSchema,
  refreshTokenValidationSchema,
  changePasswordValidationSchema,
  adminChangePasswordValidationSchema,
  // forgotPasswordValidationSchema,
  resetPasswordValidationSchema,
};
