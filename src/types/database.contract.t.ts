import type { AuthModel } from './auth.t.ts';

export interface DbProvider {
	findAccountById<T = AuthModel>({
		...args
	}: {
		id: string;
		select?: any;
	}): Promise<T | undefined>;
	findAccountByEmail<T = AuthModel>({
		...args
	}: {
		email: string;
		select?: any;
	}): Promise<T | undefined>;

	findAccountWithCredential<T = AuthModel>({
		...args
	}: {
		email?: string | undefined;
		phoneNumber?: string | undefined;
		select?: any;
	}): Promise<T | undefined>;

	createAccount<T = AuthModel>({
		...args
	}: {
		data: any;
		select?: any;
	}): Promise<T>;

	updateAccount<T = AuthModel>({
		...args
	}: {
		id: string;
		data: any;
		select?: any;
	}): Promise<T>;

	updateAccountLogin<T = AuthModel>({
		...args
	}: {
		id: string;
		refreshToken: string;
		select?: any;
	}): Promise<T>;

	removeAndAddRefreshToken({
		...args
	}: {
		id: string;
		refreshToken: string;
		newRefreshToken?: string;
		select?: any;
	}): Promise<any>;

	deleteAccount({ ...args }: { id: string }): Promise<void>;
}
