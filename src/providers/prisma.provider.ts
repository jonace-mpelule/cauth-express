import type { PrismaClient } from '@/generated/prisma/index.d.ts';
import type { AuthModel } from '@/types/auth.t.ts';
import type { DbProvider } from '@/types/database.contract.t.ts';

export class PrismaProvider implements DbProvider {
	#client: PrismaClient;
	constructor(private client: PrismaClient) {
		this.#client = client;
	}

	async findAccountById<T>({ id }: { id: string }) {
		return (await (this.#client as any).auth.findFirst({
			where: { id },
		})) as T;
	}

	async findAccountByEmail({ email }: { email: string }) {
		return await (this.#client as any).auth.findFirst({
			where: { email },
		});
	}

	async findAccountWithCredential({
		...args
	}: {
		email?: string;
		phoneNumber?: string;
		select?: any;
	}) {
		return await (this.#client as any).auth.findFirst({
			where: {
				OR: [{ email: args.email }, { phoneNumber: args.phoneNumber }],
			},
			select: args.select,
		});
	}

	async createAccount(data: any) {
		return await (this.#client as any).auth.create({ data });
	}

	async removeAndAddRefreshToken<T>({
		id,
		refreshToken,
		select,
		newRefreshToken,
	}: {
		id: string;
		refreshToken: string;
		select?: any;
		newRefreshToken?: string;
	}): Promise<T> {
		const account = await this.findAccountById<AuthModel | null>({ id });
		if (!account) {
			throw new Error(`account-not-found: ${id}`);
		}

		let updatedTokens = account.refreshTokens.filter((t) => t !== refreshToken);
		if (newRefreshToken) {
			updatedTokens.push(newRefreshToken);
			updatedTokens = Array.from(new Set(updatedTokens));
		}

		return (this.#client as any).auth.update({
			where: { id },
			data: { refreshTokens: { set: updatedTokens } },
			select,
		}) as Promise<T>;
	}

	async updateAccountLogin({
		...args
	}: {
		id: string;
		refreshToken: string;
		select?: any;
	}) {
		return (this.#client as any).auth.update({
			where: {
				id: args.id,
			},
			data: {
				lastLogin: new Date(),
				refreshTokens: {
					push: args.refreshToken,
				},
			},
			select: args.select,
		});
	}

	async updateAccount({ ...args }: { id: string; data: any }) {
		return await (this.#client as any).auth.update({
			where: { id: args.id },
			data: args.data,
		});
	}

	async deleteAccount({ id }: { id: string }) {
		return await (this.#client as any).auth.delete({ where: { id } });
	}
}
