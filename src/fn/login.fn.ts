import bcrypt from 'bcrypt';
import type { _CAuth } from '@/cauth.service.ts';
import {
	CredentialMismatchError,
	InvalidDataError,
} from '@/errors/auth-errors.ts';
import type { CAuthOptions } from '@/types/config.t.ts';
import { LoginSchema, type LoginSchemaType } from '@/types/dto-schemas.t.ts';
import { err, success } from '@/types/result.t.ts';

type loginDeps = {
	config: CAuthOptions;
	tokens: _CAuth<any>['Tokens'];
};

export async function LoginFn(
	{ config, tokens }: loginDeps,
	{ ...args }: LoginSchemaType,
) {
	const out = LoginSchema.safeParse(args);
	if (!out.success) {
		return err(new InvalidDataError('invalid-data-passed'));
	}

	const account = await config.dbProvider.findAccountWithCredential({
		email: args.email,
		phoneNumber: args.phoneNumber,
	});

	if (!account) {
		return err(new CredentialMismatchError());
	}

	const passwordMatch = await bcrypt.compare(
		args.password,
		account.passwordHash,
	);
	if (!passwordMatch) {
		return err(new CredentialMismatchError());
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
