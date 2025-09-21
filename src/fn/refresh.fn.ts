import type { CAuth } from '@/cauth.service.ts';
import type { Config } from '@/types/config.t.ts';
import {
	RefreshTokenSchema,
	type RefreshTokenSchemaType,
} from '@/types/dto-schemas.t.ts';
import { tryCatch } from '@/utils/try-catch.ts';

type RefreshDeps = {
	config: Config;
	tokens: CAuth['Tokens'];
};

export async function RefreshFn(
	{ config, tokens }: RefreshDeps,
	{ ...args }: RefreshTokenSchemaType,
) {
	const out = RefreshTokenSchema.safeParse(args);

	if (!out.success) {
		return { success: false, code: 'invalid-data-passed' } as const;
	}

	const payload = await tryCatch(
		tokens.VerifyRefreshToken<{ id: string }>(args.refreshToken),
	);

	if (payload.error) {
		return { success: false, code: 'invalid-refresh-token' } as const;
	}

	const account = await config.DbProvider.findAccountById({
		id: String(payload.data?.id),
	});

	if (!account) {
		return { success: false, code: 'account-not-found' } as const;
	}

	if (!account.refreshTokens.includes(args.refreshToken)) {
		return { success: false, code: 'invalid-refresh-token' } as const;
	}

	const tokenPair = await tokens.GenerateTokenPairs({
		id: account.id,
		role: account.role,
	});
	await config.DbProvider.updateAccountLogin({
		id: account.id,
		refreshToken: tokenPair.refreshToken,
	});

	return { success: true, account, tokens: tokenPair } as const;
}
