import { create } from "zustand";

interface ServerStatusState {
    isAvailable: boolean;
    dependencies: {
        database: string;
        redis: string;
        pythonServer: string;
    };
    setAvailable: (available: boolean, dependencies?: any) => void;
}

export const useServerStatus = create<ServerStatusState>((set) => ({
    isAvailable: true,
    dependencies: {
        database: "unknown",
        redis: "unknown",
        pythonServer: "unknown",
    },
    setAvailable: (available, dependencies) =>
        set({
            isAvailable: available,
            dependencies: dependencies || {
                database: "unknown",
                redis: "unknown",
                pythonServer: "unknown",
            },
        }),
}));
