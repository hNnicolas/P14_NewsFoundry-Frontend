/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        white: "var(--color-white)",
        black: "var(--color-black)",
        mainText: "var(--text-main)",
        subText: "var(--text-sub)",
        bgGeneral: "var(--bg-general)",
        bgHomepage: "var(--bg-homepage)",
        bgPresse: "var(--bg-presse)",
        bgChat: "var(--bg-chat)",
        bgUserChat: "var(--bg-user-chat)",
        bgAiChat: "var(--bg-ai-chat)",
        bgLogin: "var(--bg-login)",
        bgInput: "var(--bg-input)",
        bgButtonPrimary: "var(--bg-button-primary)",
        bgButtonSecondary: "var(--bg-button-secondary)",
        bgButtonChat: "var(--bg-button-chat)",
        bgNeutralLight: "var(--bg-neutral-light)",
      },
    },
  },
  plugins: [],
};
