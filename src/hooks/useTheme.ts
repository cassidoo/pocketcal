import { useEffect } from "react";
import { useStore } from "../store";

export function useTheme() {
	const { theme, setTheme } = useStore();

	useEffect(() => {
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

		const handleChange = () => {
			if (theme === "system") {
				const isDarkMode = mediaQuery.matches;
				document.documentElement.classList.toggle("dark", isDarkMode);
				useStore.setState({ isDarkMode });
			}
		};

		mediaQuery.addEventListener("change", handleChange);

		if (theme === "system") {
			const isDarkMode = mediaQuery.matches;
			document.documentElement.classList.toggle("dark", isDarkMode);
			useStore.setState({ isDarkMode });
		}

		return () => {
			mediaQuery.removeEventListener("change", handleChange);
		};
	}, [theme, setTheme]);
}
