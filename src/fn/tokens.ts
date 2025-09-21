import jwt from 'jsonwebtoken';
import type { Config } from '@/types/config.t.ts';

type TokenDeps = {
	payload: any;
	config: Config;
};

type VerificationDeps = {
	token: any;
	config: Config;
};

export async function GenerateAccessToken({
	...args
}: TokenDeps): Promise<string> {
	const accessToken = jwt.sign(args.payload, args.config.AccessTokenSecret, {
		expiresIn: args.config.JwtConfig?.AccessTokenLifeSpan ?? '15m',
	});
	return accessToken;
}

export async function GenerateRefreshToken({
	...args
}: TokenDeps): Promise<string> {
	const refreshToken = jwt.sign(args.payload, args.config.RefreshTokenSecret, {
		expiresIn: args.config.JwtConfig?.RefreshTokenLifeSpan ?? '30d',
	});

	return refreshToken;
}

export async function GenerateTokenPairs({ ...args }: TokenDeps): Promise<{
	accessToken: string;
	refreshToken: string;
}> {
	const accessToken = jwt.sign(args.payload, args.config.AccessTokenSecret, {
		expiresIn: args.config.JwtConfig?.AccessTokenLifeSpan ?? '15m',
	});

	const refreshToken = jwt.sign(args.payload, args.config.RefreshTokenSecret, {
		expiresIn: args.config.JwtConfig?.RefreshTokenLifeSpan ?? '30d',
	});

	return { accessToken, refreshToken };
}

export async function VerifyRefreshToken<T>({
	...args
}: VerificationDeps): Promise<T | null> {
	const out = jwt.verify(args.token, args.config.RefreshTokenSecret);

	if (out instanceof String) return null;

	return out as T;
}

export async function VerifyAccessToken<T>({
	...args
}: VerificationDeps): Promise<T | null> {
	const out = jwt.verify(args.token, args.config.AccessTokenSecret);

	if (out instanceof String) return null;

	return out as T;
}
