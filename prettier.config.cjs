module.exports = {
	// Approximate VS Code built-in JS/TS formatter defaults
	printWidth: 120,
	tabWidth: 4,
	useTabs: true,
	singleQuote: false,
	bracketSameLine: false,
	trailingComma: "es5",
	singleAttributePerLine: false,

	plugins: [require.resolve("prettier-plugin-tailwindcss")],
	tailwindAttributes: ["className"],
};
