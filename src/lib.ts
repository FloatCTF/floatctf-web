import { useState } from "react";

export type TypedState<T extends object> = {
	state: T;
	update: <K extends keyof T>(key: K, value: T[K]) => void;
	setState: React.Dispatch<React.SetStateAction<T>>;
};

export function useTypedState<T extends object>(initial: T): TypedState<T> {
	const [state, setState] = useState<T>(initial);

	const update = <K extends keyof T>(key: K, value: T[K]) =>
		setState((prev) => ({ ...prev, [key]: value }));

	return { state, update, setState } as const;
}
