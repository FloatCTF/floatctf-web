import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

export function DatetimeToShow(datetime: string | undefined | null) {
	if (!datetime) {
		return dayjs().utc().format("YYYY-MM-DDTHH:mm:ss");
	}
	return dayjs.utc(datetime).local().format("YYYY-MM-DD HH:mm:ss");
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const diffToPatch = <T extends Record<string, any>>(
	original: T,
	current: T,
	options?: {
		allowKeys?: (keyof T)[];
		ignoreKeys?: (keyof T)[];
		keepId?: boolean; // 默认智能控制
	},
) => {
	const { allowKeys, ignoreKeys = [], keepId = true } = options ?? {};

	// 确定实际要比较的字段集
	const baseKeys =
		allowKeys && allowKeys.length > 0
			? allowKeys
			: (Object.keys(current) as (keyof T)[]);

	// ⚙️ 智能判断是否保留 id
	const shouldKeepId =
		// 1️⃣ 明确在 allowKeys 里 → 保留
		allowKeys?.includes("id" as keyof T) ||
		// 2️⃣ 没传 allowKeys、没显式 ignore id 且 keepId=true → 保留
		(keepId && !ignoreKeys.includes("id" as keyof T));

	const result: Partial<T> = {};

	// ✅ 保留 id（如果符合规则）
	if (shouldKeepId && "id" in current && current.id !== undefined) {
		// @ts-ignore
		result.id = current.id;
	}

	for (const key of baseKeys) {
		if (ignoreKeys.includes(key)) continue;
		if (key === "id") continue; // 防止重复处理 id
		if (current[key] !== original[key] && current[key] !== undefined) {
			result[key] = current[key];
		} else {
			// @ts-ignore
			result[key] = null;
		}
	}

	return result;
};
