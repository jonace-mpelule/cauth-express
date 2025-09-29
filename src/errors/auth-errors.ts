export class DuplicateAccountError extends Error {
	public code;
	constructor() {
		super('AccountAlreadyExists');
		this.message = 'Account already exists' as const;
		this.code = 'duplicate-account';
	}
}

export class InvalidRoleError extends Error {
	public code;
	constructor(roles: string[]) {
		super(`Role should can only be; ${roles.map((e) => e)}`);
		this.name = 'InvalidRoleError';
		this.code = 'invalid-role';
	}
}

export class InvalidDataError extends Error {
	public code;
	constructor(message: string) {
		super(message);
		this.name = 'InvalidDataError';
		this.code = 'invalid-data';
	}
}

export class CredentialMismatchError extends Error {
	public code;
	constructor() {
		super('Credentials do not match any account');
		this.name = 'CredentialMismatchError';
		this.code = 'credential-mismatch';
	}
}

export class InvalidRefreshTokenError extends Error {
	public code;
	constructor() {
		super('Invalid refresh token');
		this.name = 'InvalidTokenError';
		this.code = 'invalid-refresh-token';
	}
}

export class AccountNotFoundError extends Error {
	public code;
	constructor() {
		super('Account not found');
		this.name = 'AccountNotFoundError';
		this.code = 'account-not-found';
	}
}
