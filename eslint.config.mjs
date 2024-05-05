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
			"eol-last": "warn",
			"quotes": "off",
			"semi": "off",
			"no-constant-binary-expression": "warn",
			"no-undef": "off",
			"no-console": "off",
			"no-debugger": "warn",
			"no-sequences": "warn",
			"no-import-assign": "warn",
			"no-extend-native": "warn",
			"no-trailing-spaces": "warn",
			"no-case-declarations": "warn",
			"no-prototype-builtins": "warn",
			"no-unused-expressions": "warn",
			"space-before-function-paren": "off",
			"no-unused-vars": "warn",
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
