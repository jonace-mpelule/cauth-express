import type { ZodSafeParseResult } from 'zod';

export async function formatZodIssues<T>(out: ZodSafeParseResult<T>) {
	return `${out?.error?.issues[0].path}: ${out?.error?.issues[0].message}`;
}
