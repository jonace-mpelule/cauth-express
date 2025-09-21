import bcrypt from 'bcrypt';
import type { CAuth } from '@/cauth.service.ts';
import { formatZodIssues } from '@/helpers/zod-joined-issues.ts';
import type { Config } from '@/types/config.t.ts';
import {
	RegisterSchema,
	type RegisterSchemaType,
} from '@/types/dto-schemas.t.ts';

type RegisterDeps = {
	config: Config;
	tokens: CAuth['Tokens'];
};

export async function RegisterFn(
	{ config, tokens }: RegisterDeps,
	{ ...args }: RegisterSchemaType,
) {
	const out = RegisterSchema.safeParse(args);
	if (!out.success) {
		throw {
			success: false,
			code: 'invalid-data-passed',
			message: formatZodIssues(out),
		} as const;
	}

	const isRoleValid = config.Roles?.includes(args.role);

	if (!isRoleValid) {
		return {
			success: false,
			code: 'invalid-role',
			message: `role should can only be; ${config.Roles?.map((e) => e)}`,
		} as const;
	}

	const existing = await config.DbProvider.findAccountWithCredential({
		email: args.email,
	});
	if (existing) {
		return { success: false, code: 'account-exists' } as const;
	}

	const passwordHash = await bcrypt.hash(args.password, 10);

	const account = await config.DbProvider.createAccount({
		data: {
			email: args.email,
			phoneNumber: args.phoneNumber,
			passwordHash,
			roles: args.role,
		},
	});

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
