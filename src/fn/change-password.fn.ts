import bcrypt from 'bcrypt';
import type { _CAuth } from '@/cauth.service.ts';
import { formatZodIssues } from '@/helpers/zod-joined-issues.ts';
import type { CAuthOptions } from '@/types/config.t.ts';
import {
	ChangePasswordSchema,
	type ChangePasswordSchemaType,
} from '@/types/dto-schemas.t.ts';

type ChangePasswordDeps = {
	config: CAuthOptions;
	tokens?: _CAuth<any>['Tokens'];
};

export async function ChangePasswordFn(
	{ config }: ChangePasswordDeps,
	{ ...args }: ChangePasswordSchemaType,
) {
	const out = ChangePasswordSchema.safeParse(args);

	if (!out.success) {
		return {
			success: false,
			code: 'invalid-body',
			message: formatZodIssues(out),
		} as const;
	}

	const account = await config.dbProvider.findAccountById({
		id: args.accountId,
	});
	if (!account) {
		return { success: false, code: 'account-not-found' } as const;
	}

	const passwordMatch = await bcrypt.compare(
		args.oldPassword,
		account.passwordHash,
	);
	if (!passwordMatch) {
		return { success: false, code: 'invalid-credentials' } as const;
	}

	const newHash = await bcrypt.hash(args.newPassword, 10);
	await config.dbProvider.updateAccount({
		id: account.id,
		data: { passwordHash: newHash },
	});

	return { success: true, code: 'password-changed' } as const;
}
