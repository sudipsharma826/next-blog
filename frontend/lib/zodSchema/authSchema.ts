import { z } from 'zod';
// for the forget password component schemas ( sepreated here for step wise form submission)
export const emailSchema = z.object({ email: z.string().email('Invalid email address') });
export const otpSchema = z.object({ otp: z.string().min(6, 'OTP must be at least 6 characters') });
export const password = z.object({
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(20, 'Password must be at most 20 characters')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Must include a special character')
    .regex(/[A-Z]/, 'Must include an uppercase letter')
    .regex(/[a-z]/, 'Must include a lowercase letter')
    .regex(/[0-9]/, 'Must include a number'),
});

//login schema
export const loginSchema = z.object({
  email: emailSchema.shape.email,
  password: password.shape.password,
});
export type LoginFormData = z.infer<typeof loginSchema>;

//Forget Password
export const forgotPasswordEmailSchema = z.object({
  email: emailSchema.shape.email,
});
export type ForgotPasswordEmailData = z.infer<typeof forgotPasswordEmailSchema>;
export const forgotPasswordOtpSchema = z.object({
  otp: otpSchema.shape.otp,
});
export type ForgotPasswordOtpData = z.infer<typeof forgotPasswordOtpSchema>;
export const forgotPasswordResetSchema = z
  .object({
    password: password.shape.password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    //validation
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type ForgotPasswordResetData = z.infer<typeof forgotPasswordResetSchema>;
