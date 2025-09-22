import type { NextFunction, Request, Response } from 'express';
import type { _CAuth } from '@/cauth.service.ts';
import type { CAuthOptions } from '@/types/config.t.ts';
import { tryCatch } from '@/utils/try-catch.ts';

type AuthGuardDeps = {
	config: CAuthOptions;
	tokens: _CAuth<any>['Tokens'];
	roles?: Array<string>;
};

export function AuthGuard({ config, tokens, roles }: AuthGuardDeps) {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			let token = req.cookies?.accessToken;

			if (!token) {
				const authHeader = req.headers.authorization;
				if (authHeader?.startsWith('Bearer ')) {
					token = authHeader.split(' ')[1];
				}
			}

			if (!token) {
				return res.status(401).send({ code: 'invalid-token' });
			}

			const out = await tryCatch(
				tokens.VerifyAccessToken<{ id: string; role: string }>(token),
			);

			if (out.error || !out.data) {
				return res.status(401).send({ code: 'invalid-token' });
			}

			if (roles && !roles.includes(out.data.role)) {
				return res.status(403).send({
					code: 'forbidden-resource',
					message: "You don't have sufficient permission for this action",
				});
			}

			if (!config.roles.includes(out.data.role)) {
				return res.status(403).send({
					code: 'forbidden-resource',
					message: "You don't have sufficient permission for this action",
				});
			}

			req.cauth = {
				id: out.data.id,
				role: out.data.role,
			};

			return next();
		} catch (_) {
			return res.status(500).send({ code: 'server-error' });
		}
	};
}
