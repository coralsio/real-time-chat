import type {Config} from "tailwindcss";

const {nextui} = require("@nextui-org/react");

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
            colors: {
                primary: "#92D050",
                secondary: "#ED7D31",
                black: "#5C5C5C",
                black2: "#282828",
                black3: "#2B2C31",
                gray: "#A0A0A0",
                gray2: "#E8E8E8",
                gray3: "#D9D9D9",
                white0: "#FCFCFC",
                white2: "rgb(243 243 243)",
                white3: "#E9E9E9",
                grayLight: "#C8C8C8",
                grayDark: "#7A7A7A"
            }
        },
    },
    darkMode: "class",
    plugins: [
        nextui(),
    ],
};
export default config;
