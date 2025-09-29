import type { _CAuth } from '@/cauth.service.ts';
import {
	InvalidDataError,
	InvalidRefreshTokenError,
} from '@/errors/auth-errors.ts';
import type { CAuthOptions } from '@/types/config.t.ts';
import { LogoutSchema, type LogoutSchemaType } from '@/types/dto-schemas.t.ts';
import { err, success } from '@/types/result.t.ts';
import { tryCatch } from '@/utils/try-catch.ts';

type LogoutDeps = {
	config: CAuthOptions;
	tokens: _CAuth<any>['Tokens'];
};

export async function LogoutFn(
	{ config, tokens }: LogoutDeps,
	{ ...args }: LogoutSchemaType,
) {
	const out = LogoutSchema.safeParse(args);

	if (!out.success) {
		return err(new InvalidDataError('invalid-data-passed'));
	}

	const payload = await tryCatch(
		tokens.VerifyRefreshToken<{ id: string }>(args.refreshToken),
	);

	if (payload.error) {
		return err(new InvalidRefreshTokenError());
	}

	if (!payload) {
		return err(new InvalidRefreshTokenError());
	}

	await config.dbProvider.removeAndAddRefreshToken({
		id: String(payload.data?.id),
		refreshToken: args.refreshToken,
	});

	return success({ code: 'logged-out' });
}
