import { defineConfig } from 'tsdown';

export default defineConfig({
	entry: ['./src/index.ts'],
	clean: true,
	dts: true,
	format: 'esm',
	minify: true,
	target: 'es2022',
	outDir: 'dist',
	external: ['@prisma/client'],
	watch: false,
	define: {},
});
