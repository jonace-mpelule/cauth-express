import type { Request, Response } from 'express';
import type { CAuth } from '@/cauth.service.ts';
import { formatZodIssues } from '@/helpers/zod-joined-issues.ts';
import type { Config } from '@/types/config.t.ts';
import { LogoutSchema } from '@/types/dto-schemas.t.ts';

type LogoutDeps = {
	config: Config;
	tokens: CAuth['Tokens'];
};

export function Logout({ config, tokens }: LogoutDeps) {
	return async (req: Request, res: Response) => {
		try {
			const out = LogoutSchema.safeParse(req.body);

			if (!out.success) {
				return res.status(400).send({
					code: 'invalid-body',
					message: formatZodIssues(out),
				});
			}

			const { refreshToken } = out.data;

			const payload = await tokens.VerifyRefreshToken<{ id: string }>(
				refreshToken,
			);

			if (!payload) {
				return res.status(401).send({ code: 'invalid-refresh-token' });
			}

			await config.dbProvider.removeAndAddRefreshToken({
				id: payload.id,
				refreshToken: refreshToken,
			});

			return res.status(200).send({ code: 'logged-out' });
		} catch (err) {
			console.error('Logout error:', err);
			return res.status(500).send({ code: 'server-error' });
		}
	};
}
