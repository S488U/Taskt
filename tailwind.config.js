// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],

	presets: [require("nativewind/preset")],

	darkMode: "class",

	theme: {
		extend: {
			colors: {
				// Background Layers
				background: {
					DEFAULT: "#F8FAFC", // Light base
					dark: "#0F172A", // Dark base
				},
				surface: {
					DEFAULT: "#FFFFFF", // Light cards
					dark: "#1E293B", // Dark cards
				},

				// Brand
				primary: {
					DEFAULT: "#4F46E5",
					dark: "#6366F1",
				},
				secondary: {
					DEFAULT: "#64748B",
					dark: "#94A3B8",
				},

				// Text
				text: {
					DEFAULT: "#0F172A",
					dark: "#FFFFFF",
				},

				// Feedback
				success: "#10B981",
				danger: "#EF4444",
				warning: "#F59E0B",

				// Borders
				border: {
					DEFAULT: "#E2E8F0",
					dark: "#334155",
				},
			},

			fontFamily: {
				inter: ["InterRegular"],
				interMedium: ["InterMedium"],
				interSBold: ["InterSemiBold"],
				interBold: ["InterBold"],
			},

			borderRadius: {
				task: "12px",
			},

			boxShadow: {
				minimal: "0 1px 3px 0 rgba(0,0,0,0.05)",
			},
		},
	},

	plugins: [],
};
