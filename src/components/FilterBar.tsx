import { FilterIcon, SearchIcon } from "@primer/octicons-react";
import { Button } from "@primer/react";
import { useRef, useState } from "react";
export interface FilterBarProps {
	keys: string[];
}

export const FilterBar = ({ keys = [] }: FilterBarProps) => {
	const [value, setValue] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);
	const highlightRef = useRef<HTMLDivElement>(null);

	const parsedRef = useRef<Record<string, string>>({});

	const getHighlightedText = (text: string) => {
		const regex = /(\w+):(.*?)(\s|$)/g;
		const escaped = text
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;");

		const highlighted = escaped.replace(regex, (_, key, val, space) => {
			// 忽略大小写匹配 keys
			const matchedKey = keys.find(
				(k) => k.toLowerCase() === key.toLowerCase(),
			);
			if (matchedKey) {
				// 存入字典时使用小写
				parsedRef.current[matchedKey.toLowerCase()] = val;
				return `<span style="color:#000">${key}:</span><span style="color:#0757ba;background-color:#ddf4ff">${val}</span>${space}`;
			}
			return `<span style="color:#000">${key}:${val}</span>${space}`;
		});

		return highlighted.replace(/\n/g, "<br>");
	};

	return (
		<div className="w-full flex">
			<Button
				style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
				leadingVisual={FilterIcon}
			>
				Filter
			</Button>

			<div className="relative w-full bg-white border focus-within:ring-2 focus-within:ring-[#0969da] focus-within:border-[#0969da]">
				{/* 高亮层 */}
				<div
					ref={highlightRef}
					className="absolute top-0 left-0 w-full h-full px-3 py-1 pointer-events-none whitespace-pre-wrap break-words"
					style={{
						fontSize: "15px",
						fontFamily: "inherit",
						lineHeight: "inherit",
						color: "#000", // 默认文字颜色
					}}
					// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
					dangerouslySetInnerHTML={{ __html: getHighlightedText(value) }}
				/>

				{/* 输入框透明 */}
				<input
					ref={inputRef}
					type="text"
					placeholder="Search or filter like `key1:value1 key2:value2`"
					className="relative w-full bg-transparent px-3 py-1 border-none outline-none text-transparent caret-black"
					style={{
						fontSize: "15px",
						fontFamily: "inherit",
						lineHeight: "inherit",
					}}
					value={value}
					onChange={(e) => setValue(e.target.value)}
				/>
			</div>

			<Button
				style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
				leadingVisual={SearchIcon}
			>
				Query
			</Button>
		</div>
	);
};
