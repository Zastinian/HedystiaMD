/** @type {import("prettier").Config} */
export default {
	printWidth: 100,
	semi: true,
	singleQuote: false,
	jsxSingleQuote: false,
	quoteProps: "consistent",
	tabWidth: 2,
	trailingComma: "all",
	bracketSpacing: true,
	bracketSameLine: false,
	rangeStart: 0,
	useTabs: true,
	endOfLine: "lf",
	proseWrap: "preserve",
	vueIndentScriptAndStyle: false,
	embeddedLanguageFormatting: "auto",
	singleAttributePerLine: false,
	arrowParens: "always",
	overrides: [
		{
			files: ["*.json", "*.md", "*.toml", "*.yml"],
			options: {
				useTabs: false,
			},
		},
	],
};
