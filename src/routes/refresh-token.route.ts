import type { Request, Response } from 'express';
import type { _CAuth } from '@/cauth.service.ts';
import { formatZodIssues } from '@/helpers/zod-joined-issues.ts';
import { AuthModelSelect } from '@/types/auth.t.ts';
import type { CAuthOptions } from '@/types/config.t.ts';
import { RefreshTokenSchema } from '@/types/dto-schemas.t.ts';

type RefreshDeps = {
	config: CAuthOptions;
	tokens: _CAuth<any>['Tokens'];
};

export function Refresh({ config, tokens }: RefreshDeps) {
	return async (req: Request, res: Response) => {
		try {
			const out = RefreshTokenSchema.safeParse(req.body);
			if (!out.success) {
				return res.status(400).send({
					code: 'invalid-body',
					message: formatZodIssues(out),
				});
			}
			const { refreshToken } = out.data;

			// VERIFY TOKEN
			const payload = await tokens.VerifyRefreshToken<{ id: string }>(
				refreshToken,
			);
			if (!payload)
				return res.status(401).send({ code: 'invalid-refresh-token' });

			const account = await config.dbProvider.findAccountById({
				id: payload.id,
			});
			if (!account) return res.status(404).send({ code: 'account-not-found' });

			// OPTIONALLY CHECK THAT REFRESH TOKEN EXISTS IN DB
			if (!account.refreshTokens.includes(refreshToken)) {
				return res.status(401).send({ code: 'invalid-refresh-token' });
			}

			// GENERATE NEW PAIR
			const tokenPair = await tokens.GenerateTokenPairs({
				id: account.id,
				role: account.role,
			});

			// UPDATE DB WITH NEW REFRESH TOKEN (PUSH & REMOVE OLD)
			await config.dbProvider.removeAndAddRefreshToken({
				id: account.id,
				refreshToken,
				newRefreshToken: tokenPair.refreshToken,
				select: AuthModelSelect,
			});

			return res.status(200).send({ tokens: tokenPair });
		} catch (err) {
			console.error('Refresh token error:', err);
			return res.status(500).send({ code: 'server-error' });
		}
	};
}
