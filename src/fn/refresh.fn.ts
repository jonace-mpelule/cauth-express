import type { _CAuth } from '@/cauth.service.ts';
import {
	AccountNotFoundError,
	InvalidDataError,
	InvalidRefreshTokenError,
} from '@/errors/auth-errors.ts';
import type { CAuthOptions } from '@/types/config.t.ts';
import {
	RefreshTokenSchema,
	type RefreshTokenSchemaType,
} from '@/types/dto-schemas.t.ts';
import { err, success } from '@/types/result.t.ts';
import { tryCatch } from '@/utils/try-catch.ts';

type RefreshDeps = {
	config: CAuthOptions;
	tokens: _CAuth<any>['Tokens'];
};

export async function RefreshFn(
	{ config, tokens }: RefreshDeps,
	{ ...args }: RefreshTokenSchemaType,
) {
	const out = RefreshTokenSchema.safeParse(args);

	if (!out.success) {
		return err(new InvalidDataError('Invalid data passed'));
	}

	const payload = await tryCatch(
		tokens.VerifyRefreshToken<{ id: string }>(args.refreshToken),
	);

	if (payload.error) {
		return err(new InvalidRefreshTokenError());
	}

	const account = await config.dbProvider.findAccountById({
		id: String(payload.data?.id),
	});

	if (!account) {
		return err(new AccountNotFoundError());
	}

	if (!account.refreshTokens.includes(args.refreshToken)) {
		return err(new InvalidRefreshTokenError());
	}

	const tokenPair = await tokens.GenerateTokenPairs({
		id: account.id,
		role: account.role,
	});
	await config.dbProvider.updateAccountLogin({
		id: account.id,
		refreshToken: tokenPair.refreshToken,
	});

	return success({ account, tokens: tokenPair });
}
