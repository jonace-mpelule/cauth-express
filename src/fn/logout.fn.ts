import type { CAuth } from '@/cauth.service.ts';
import type { Config } from '@/types/config.t.ts';
import { LogoutSchema, type LogoutSchemaType } from '@/types/dto-schemas.t.ts';
import { tryCatch } from '@/utils/try-catch.ts';

type LogoutDeps = {
	config: Config;
	tokens: CAuth['Tokens'];
};

export async function LogoutFn(
	{ config, tokens }: LogoutDeps,
	{ ...args }: LogoutSchemaType,
) {
	const out = LogoutSchema.safeParse(args);

	if (!out.success) {
		return { success: false, code: 'invalid-data-passed' } as const;
	}

	const payload = await tryCatch(
		tokens.VerifyRefreshToken<{ id: string }>(args.refreshToken),
	);

	if (payload.error) {
		return { success: false, code: 'invalid-refresh-token' } as const;
	}

	if (!payload) {
		return { success: false, code: 'invalid-refresh-token' } as const;
	}

	await config.DbProvider.removeAndAddRefreshToken({
		id: String(payload.data?.id),
		refreshToken: args.refreshToken,
	});

	return { success: true, code: 'logged-out' } as const;
}
