import { z } from "zod";

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const LoginResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_in: z.number(),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export const RefreshTokenRequestSchema = z.object({
  refresh_token: z.string(),
});

export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;

export const JwtPayloadSchema = z.object({
  sub: z.string().uuid(), // user id
  email: z.string().email(),
  role: z.string(),
  permissions: z.array(z.string()),
  iat: z.number(),
  exp: z.number(),
});

export type JwtPayload = z.infer<typeof JwtPayloadSchema>;
