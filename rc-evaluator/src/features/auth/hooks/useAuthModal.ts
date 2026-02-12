import { useContext } from "react";
import { AuthUIContext } from "../context/authui.context";

export const useAuthModal = () => {
	const context = useContext(AuthUIContext);
	if (!context) throw new Error("useAuthModal must be used within UIProvider");
	return context;
};
