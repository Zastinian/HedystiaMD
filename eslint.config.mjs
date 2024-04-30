import eslintConfigPrettier from "eslint-config-prettier";
import functional from "eslint-plugin-functional";
import imprt from "eslint-plugin-import";

export default [
	eslintConfigPrettier,
	{
		files: ["**/*.{ts,js}"],
		plugins: {
			functional,
			import: imprt,
		},
		languageOptions: {
			parserOptions: {
				ecmaFeatures: { modules: true },
				ecmaVersion: "latest",
			},
		},
		rules: {
			"eol-last": "off",
			"quotes": "off",
			"semi": "off",
			"@stylistic/js/no-tabs": "off",
			"@stylistic/ts/indent": "off",
			"no-constant-binary-expression": "warn",
			"no-undef": "off",
			"no-console": "off",
			"no-debugger": "warn",
			"no-sequences": "off",
			"no-import-assign": "off",
			"no-extend-native": "off",
			"no-trailing-spaces": "warn",
			"no-case-declarations": "off",
			"no-prototype-builtins": "off",
			"no-unused-expressions": "off",
			"space-before-function-paren": "off",
			"antfu/if-newline": "off",
			"antfu/top-level-function": "off",
			"@stylistic/js/operator-linebreak": "off",
			"@stylistic/ts/brace-style": "off",
			"@stylistic/js/multiline-ternary": "off",
			"n/prefer-global/process": "off",
			"@stylistic/js/no-mixed-spaces-and-tabs": "off",
			"no-unused-vars": "off",
			"unused-imports/no-unused-vars": "off",
			"object-curly-newline": [
				"warn",
				{
					consistent: true,
					multiline: true,
				},
			],
			"object-curly-spacing": ["warn", "always"],
			"array-element-newline": ["warn", "consistent"],
			"array-bracket-newline": ["warn", "consistent"],
		},
	},
];
