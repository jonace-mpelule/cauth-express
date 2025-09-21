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
import { type Config, ConfigSchema } from './types/config.t.ts';
import type {
	ChangePasswordSchemaType,
	LoginSchemaType,
	LogoutSchemaType,
	RefreshTokenSchemaType,
	RegisterSchemaType,
} from './types/dto-schemas.t.ts';

export class CAuth {
	#config: Config;
	constructor(config: Config) {
		const parsed = ConfigSchema.safeParse(config);
		if (!parsed.success) {
			throw new Error(
				`❌ Failed to initiate CAuth. You provided an invalid config!`,
			);
		}

		this.#config = config;
	}

	public Guard = (roles?: Array<string>) =>
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
