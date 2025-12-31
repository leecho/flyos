// tailwind.config.js
export default {
    darkMode: "class",
    content: ["./index.html", "./src/**/*.{vue,js,ts}"],
    theme: {
        extend: {
            colors: {
                accent: 'var(--accent-color)',
            }
        }
    },
    plugins: [require('@tailwindcss/container-queries')],
};
