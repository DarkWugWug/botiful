module.exports = {
	env: {
		browser: true,
		es2021: true
	},
	extends: 'standard-with-typescript',
	overrides: [
	],
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
		project: ['./tsconfig.json', './tsconfig.jest.json']
	},
	rules: {
		// https://github.com/typescript-eslint/typescript-eslint/issues/1824
		indent: 'off',
		'@typescript-eslint/indent': ['error', 'tab'],
		'no-tabs': ['error', { allowIndentationTabs: true }]
	}
}
