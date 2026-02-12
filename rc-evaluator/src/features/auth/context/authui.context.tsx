// src/context/UIContext.tsx
import React, {
	createContext,
	type ReactNode,
	useContext,
	useState,
} from "react";

type ModalType = "login" | "signup" | null;

interface UIContextType {
	modal: ModalType;
	openModal: (type: ModalType) => void;
	closeModal: () => void;
}

export const AuthUIContext = createContext<UIContextType | undefined>(
	undefined,
);

export const AuthUIProvider = ({ children }: { children: ReactNode }) => {
	const [modal, setModal] = useState<ModalType>(null);

	const openModal = (type: ModalType) => setModal(type);
	const closeModal = () => setModal(null);

	return (
		<AuthUIContext.Provider value={{ modal, openModal, closeModal }}>
			{children}
		</AuthUIContext.Provider>
	);
};
