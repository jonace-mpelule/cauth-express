import bcrypt from 'bcrypt';
import type { Request, Response } from 'express';
import type { CAuth } from '@/cauth.service.ts';
import { formatZodIssues } from '@/helpers/zod-joined-issues.ts';
import { AuthModelSelect } from '@/types/auth.t.ts';
import type { Config } from '@/types/config.t.ts';
import { LoginSchema } from '@/types/dto-schemas.t.ts';

type loginDeps = {
	config: Config;
	tokens: CAuth['Tokens'];
};

export function Login({ config, tokens }: loginDeps) {
	return async (req: Request, res: Response) => {
		try {
			const out = LoginSchema.safeParse(req.body);
			if (!out.success) {
				return res.status(400).send({
					code: 'invalid-body',
					message: await formatZodIssues(out),
				});
			}

			const { email, phoneNumber, password } = out.data;

			const account = await config.dbProvider.findAccountWithCredential({
				email,
				phoneNumber,
			});

			if (!account) {
				return res.status(401).send({ code: 'credential-mismatch' });
			}

			const passwordMatch = await bcrypt.compare(
				password,
				account.passwordHash,
			);
			if (!passwordMatch) {
				return res.status(401).send({ code: 'credential-mismatch' });
			}

			// GENERATE TOKENS
			const tokenPair = await tokens.GenerateTokenPairs({
				id: account.id,
				role: account.role,
			});

			// UPDATE ACCOUNT REFRESH TOKENS & LAST LOGIN
			const updatedAccount = await config.dbProvider.updateAccountLogin({
				id: account.id,
				refreshToken: tokenPair.refreshToken,
				select: AuthModelSelect,
			});

			return res
				.status(200)
				.send({ account: updatedAccount, tokens: tokenPair });
		} catch (err) {
			console.error('Login error:', err);
			return res.status(500).send({ code: 'server-error' });
		}
	};
}
