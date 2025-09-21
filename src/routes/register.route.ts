import bcrypt from 'bcrypt';
import type { Request, Response } from 'express';
import type { CAuth } from '@/cauth.service.ts';
import { formatZodIssues } from '@/helpers/zod-joined-issues.ts';
import { AuthModelSelect } from '@/types/auth.t.ts';
import type { Config } from '@/types/config.t.ts';
import { RegisterSchema } from '@/types/dto-schemas.t.ts';

type RegisterDeps = {
	config: Config;
	tokens: CAuth['Tokens'];
};

export function Register({ config, tokens }: RegisterDeps) {
	return async (req: Request, res: Response) => {
		try {
			const out = RegisterSchema.safeParse(req.body);
			if (!out.success) {
				return res.status(400).send({
					code: 'invalid-body',
					message: await formatZodIssues(out),
				});
			}

			const { email, phoneNumber, role, password } = out.data;

			const isRoleValid = config.Roles?.includes(role);

			if (!isRoleValid) {
				return res.status(409).send({
					code: 'invalid-role',
					message: `role should can only be; ${config.Roles?.map((e) => e)}`,
				});
			}

			// * CHECK IF ACCOUNT EXIST
			const existing = await config.DbProvider.findAccountWithCredential({
				email,
				phoneNumber,
			});

			if (existing) {
				return res.status(409).send({ code: 'account-exists' });
			}

			const passwordHash = await bcrypt.hash(password, 10);

			const account = await config.DbProvider.createAccount({
				data: {
					email,
					phoneNumber,
					passwordHash,
					role,
					lastLogin: new Date(),
				},
			});

			// * GENERATE TOKENS
			const tokenPair = await tokens.GenerateTokenPairs({
				id: account.id,
				role,
			});

			// * SAVE THE TOKENS IN DATABASE
			const updatedAccount = await config.DbProvider.updateAccountLogin({
				id: account.id,
				refreshToken: tokenPair.refreshToken,
				select: AuthModelSelect,
			});

			return res
				.status(201)
				.send({ account: updatedAccount, tokens: tokenPair });
		} catch (err) {
			console.error('Register error:', err);
			return res.status(500).send({ code: 'server-error' });
		}
	};
}
