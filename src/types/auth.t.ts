import z from 'zod';

export const AuthModelSchema = z.object({
	id: z.string(),
	phoneNumber: z.string(),
	email: z.string(),
	passwordHash: z.string(),
	role: z.string(),
	lastLogin: z.date(),
	refreshTokens: z.string().array(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export type AuthModel = z.infer<typeof AuthModelSchema>;

export const AuthModelSelect = {
	id: true,
	phoneNumber: true,
	email: true,
	passwordHash: false,
	role: true,
	lastLogin: true,
	refreshTokens: false,
	createdAt: true,
	updatedAt: true,
};
