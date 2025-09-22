import { ChangePasswordFn } from './fn/change-password.fn.ts';
import { LoginFn } from './fn/login.fn.ts';
import { LogoutFn } from './fn/logout.fn.ts';
import { RefreshFn } from './fn/refresh.fn.ts';
import { RegisterFn } from './fn/register.fn.ts';
import {
	GenerateAccessToken,
	GenerateRefreshToken,
	GenerateTokenPairs,
	VerifyAccessToken,
	VerifyRefreshToken,
} from './fn/tokens.ts';
import { AuthGuard } from './middleware/auth.guard.ts';
import { ChangePassword } from './routes/change-password.route.ts';
import { Login } from './routes/login.route.ts';
import { Logout } from './routes/logout.route.ts';
import { Refresh } from './routes/refresh-token.route.ts';
import { Register } from './routes/register.route.ts';
import { type CAuthOptions, CAuthOptionsSchema } from './types/config.t.ts';
import type {
	ChangePasswordSchemaType,
	LoginSchemaType,
	LogoutSchemaType,
	RefreshTokenSchemaType,
	RegisterSchemaType,
} from './types/dto-schemas.t.ts';

export class _CAuth<T extends string[]> {
	#config: Omit<CAuthOptions, 'roles'> & { roles: T };

	constructor(config: Omit<CAuthOptions, 'roles'> & { roles: T }) {
		const parsed = CAuthOptionsSchema.safeParse(config);
		if (!parsed.success) {
			throw new Error(
				`❌ Failed to initiate CAuth. You provided an invalid config!`,
			);
		}

		this.#config = config;
	}

	get RoleType() {
		return null as unknown as T[number];
	}

	get roles() {
		return this.#config.roles;
	}

	isRole(value: string): value is T[number] {
		return this.#config.roles.includes(value as T[number]);
	}

	public Guard = (roles?: Array<T[number]>) =>
		AuthGuard({ config: this.#config, tokens: this.Tokens, roles });

	public Routes = {
		Login: () => Login({ config: this.#config, tokens: this.Tokens }),
		Register: () => Register({ config: this.#config, tokens: this.Tokens }),
		Logout: () => Logout({ config: this.#config, tokens: this.Tokens }),
		Refresh: () => Refresh({ config: this.#config, tokens: this.Tokens }),
		ChangePassword: () =>
			ChangePassword({ config: this.#config, tokens: this.Tokens }),
	};

	public FN = {
		Login: ({ ...args }: LoginSchemaType) =>
			LoginFn({ config: this.#config, tokens: this.Tokens }, args),

		Register: ({ ...args }: RegisterSchemaType) =>
			RegisterFn({ config: this.#config, tokens: this.Tokens }, args),

		Logout: ({ ...args }: LogoutSchemaType) =>
			LogoutFn({ config: this.#config, tokens: this.Tokens }, args),

		Refresh: ({ ...args }: RefreshTokenSchemaType) =>
			RefreshFn({ config: this.#config, tokens: this.Tokens }, args),

		ChangePassword: ({ ...args }: ChangePasswordSchemaType) =>
			ChangePasswordFn({ config: this.#config, tokens: this.Tokens }, args),
	};

	public Tokens = {
		GenerateRefreshToken: (payload: any) =>
			GenerateRefreshToken({ payload, config: this.#config }),
		GenerateAccessToken: (payload: any) =>
			GenerateAccessToken({ payload, config: this.#config }),
		GenerateTokenPairs: (payload: any) =>
			GenerateTokenPairs({ payload, config: this.#config }),
		VerifyRefreshToken: <T>(token: any) =>
			VerifyRefreshToken<T>({ token, config: this.#config }),
		VerifyAccessToken: <T>(token: any) =>
			VerifyAccessToken<T>({ token, config: this.#config }),
	};
}

export function CAuth<const T extends string[]>(
	options: Omit<CAuthOptions, 'roles'> & { roles: T },
) {
	return new _CAuth(options);
}
