import bcrypt from 'bcrypt';
import type { _CAuth } from '@/cauth.service.ts';
import {
	AccountNotFoundError,
	CredentialMismatchError,
	InvalidDataError,
} from '@/errors/auth-errors.ts';
import { formatZodIssues } from '@/helpers/zod-joined-issues.ts';
import type { CAuthOptions } from '@/types/config.t.ts';
import {
	ChangePasswordSchema,
	type ChangePasswordSchemaType,
} from '@/types/dto-schemas.t.ts';
import { err, success } from '@/types/result.t.ts';

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
		return err(new InvalidDataError(await formatZodIssues(out)));
	}

	const account = await config.dbProvider.findAccountById({
		id: args.accountId,
	});

	if (!account) {
		return err(new AccountNotFoundError());
	}

	const passwordMatch = await bcrypt.compare(
		args.oldPassword,
		account.passwordHash,
	);

	if (!passwordMatch) {
		return err(new CredentialMismatchError());
	}

	const newHash = await bcrypt.hash(args.newPassword, 10);
	await config.dbProvider.updateAccount({
		id: account.id,
		data: { passwordHash: newHash },
	});

	return success({ code: 'password-changed' });
}
