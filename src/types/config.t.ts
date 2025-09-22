import type ms from 'ms';
import z from 'zod';
import type { DbProvider } from './database.contract.t.ts';

// RUN TIME CHECK FOR DATABASE PROVIDER
const DbProviderSchema = z.custom<DbProvider>(() => true, {
	message: 'Invalid DbProvider: must implement DbProvider interface',
});

const MS = z.custom<ms.StringValue>();

export const CAuthOptionsSchema = z.object({
	dbProvider: DbProviderSchema,
	refreshTokenSecret: z.string(),
	accessTokenSecret: z.string(),
	roles: z.array(z.string()).min(1),
	jwtConfig: z
		.object({
			accessTokenLifeSpan: MS.optional(),
			refreshTokenLifeSpan: MS.optional(),
		})
		.optional(),
});

export type CAuthOptions = z.infer<typeof CAuthOptionsSchema>;
