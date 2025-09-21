import bcrypt from 'bcrypt';
import type { Request, Response } from 'express';
import type { CAuth } from '@/cauth.service.ts';
import { formatZodIssues } from '@/helpers/zod-joined-issues.ts';
import type { Config } from '@/types/config.t.ts';
import { ChangePasswordSchema } from '@/types/dto-schemas.t.ts';
import { tryCatch } from '@/utils/try-catch.ts';

type ChangePasswordDeps = {
	config: Config;
	tokens: CAuth['Tokens'];
};

export function ChangePassword({ config, tokens }: ChangePasswordDeps) {
	return async (req: Request, res: Response) => {
		try {
			const out = ChangePasswordSchema.safeParse(req.body);
			if (!out.success) {
				return res
					.status(400)
					.send({ code: 'invalid-body', message: await formatZodIssues(out) });
			}

			// * GET ACCESS TOKEN
			const authHeader = req.headers.authorization;
			const token = authHeader?.split('Bearer ')[1];
			if (!token) {
				return res.status(401).send({ code: 'missing-access-token' });
			}
			// * VERIFY TOKEN
			const payload = await tryCatch(
				tokens.VerifyAccessToken<{ id: string }>(token),
			);

			if (payload.error) {
				return res.status(401).send({ code: 'invalid-access-token' });
			}

			if (!payload) {
				return res.status(401).send({ code: 'invalid-access-token' });
			}

			const account = await config.dbProvider.findAccountById({
				id: String(payload.data?.id),
			});

			if (!account) {
				return res.status(404).send({ code: 'account-not-found' });
			}

			// CHECK OLD PASSWORD
			const passwordMatch = await bcrypt.compare(
				out.data.oldPassword,
				account.passwordHash,
			);
			if (!passwordMatch) {
				return res.status(401).send({ code: 'invalid-credentials' });
			}

			// HASH & UPDATE NEW PASSWORD
			const newHash = await bcrypt.hash(out.data.newPassword, 10);
			await config.dbProvider.updateAccount({
				id: account.id,
				data: {
					passwordHash: newHash,
				},
			});

			return res.status(200).send({ code: 'password-changed' });
		} catch (err) {
			console.error('ChangePassword error:', err);
			return res.status(500).send({ code: 'server-error' });
		}
	};
}
