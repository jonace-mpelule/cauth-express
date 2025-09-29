type Result<T, E extends Error> =
	| { success: true; value: T }
	| { success: false; error: E };

export function success<T>(value: T): Result<T, never> {
	return { success: true, value };
}

export function err<E extends Error>(error: E): Result<never, E> {
	return { success: false, error };
}
