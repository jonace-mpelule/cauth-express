import bcrypt from 'bcrypt';
import type { CAuth } from '@/cauth.service.ts';
import { formatZodIssues } from '@/helpers/zod-joined-issues.ts';
import type { Config } from '@/types/config.t.ts';
import { LoginSchema, type LoginSchemaType } from '@/types/dto-schemas.t.ts';

type loginDeps = {
	config: Config;
	tokens: CAuth['Tokens'];
};

export async function LoginFn(
	{ config, tokens }: loginDeps,
	{ ...args }: LoginSchemaType,
) {
	const out = LoginSchema.safeParse(args);
	if (!out.success) {
		return {
			success: false,
			code: 'invalid-data-passed',
			message: formatZodIssues(out),
		} as const;
	}

	const account = await config.DbProvider.findAccountWithCredential({
		email: args.email,
		phoneNumber: args.phoneNumber,
	});

	if (!account) {
		return { success: false, code: 'credential-mismatch' } as const;
	}

	const passwordMatch = await bcrypt.compare(
		args.password,
		account.passwordHash,
	);
	if (!passwordMatch) {
		return { success: false, code: 'credential-mismatch' } as const;
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
