import { uploadsServiceApi } from "@/api/service";
import { ImageIcon, UploadIcon } from "@primer/octicons-react";
import { Button } from "@primer/react";
import MDEditor, {
	codeEdit,
	codeLive,
	codePreview,
	type ICommand,
} from "@uiw/react-md-editor";
import mermaid from "mermaid";
import {
	Fragment,
	type ReactNode,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { getCodeString } from "rehype-rewrite";

const randomid = () =>
	Number.parseInt(String(Math.random() * 1e15), 10).toString(36);

interface CodeProps {
	inline?: boolean;
	children?: ReactNode;
	className?: string;
	// rehype 的 node 节点（any 类型，因为库里没给完整类型定义）
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	node?: any;
}

const Code = ({ inline, children = [], className, ...props }: CodeProps) => {
	const demoid = useRef(`dome${randomid()}`);
	const [container, setContainer] = useState<HTMLElement | null>(null);
	const isMermaid =
		className && /^language-mermaid/.test(className.toLocaleLowerCase());
	const code = props?.node?.children
		? getCodeString(props.node.children)
		: Array.isArray(children) && children.length > 0
			? (children[0] as string) || ""
			: "";

	useEffect(() => {
		if (container && isMermaid && demoid.current && code) {
			mermaid
				.render(demoid.current, code)
				.then(({ svg, bindFunctions }) => {
					container.innerHTML = svg;
					if (bindFunctions) {
						bindFunctions(container);
					}
				})
				.catch((error) => {
					console.error("Mermaid 渲染错误:", error);
				});
		}
	}, [container, isMermaid, code]);

	const refElement = useCallback((node: HTMLElement | null) => {
		if (node !== null) {
			setContainer(node);
		}
	}, []);

	if (isMermaid) {
		return (
			<Fragment>
				<code id={demoid.current} style={{ display: "none" }} />
				<code className={className} ref={refElement} data-name="mermaid" />
			</Fragment>
		);
	}
	return <code className={className}>{children}</code>;
};

export interface MDPlusEditorProps {
	value: string;
	setValue: (value: string) => void;
	className?: string;
	onSave?: () => void;
}

export const MDPlusEditor = ({
	value,
	setValue,
	className,
	onSave,
}: MDPlusEditorProps) => {
	const editorRef = useRef<HTMLTextAreaElement | null>(null);
	const save: ICommand = {
		name: "Save",
		keyCommand: "Save",
		buttonProps: { "aria-label": "Insert title3" },
		icon: <UploadIcon />,
		execute: () => {
			onSave?.();
		},
	};

	const handlePaste = useCallback(
		async (event: ClipboardEvent) => {
			if (!event.clipboardData) return;

			const items = event.clipboardData.items;
			for (const item of items) {
				if (item.type.startsWith("image/")) {
					event.preventDefault(); // 阻止默认粘贴行为
					const file = item.getAsFile();
					if (!file) return;

					try {
						// 调用外部上传函数
						const url = await uploadsServiceApi.upload_image?.(file);

						if (url.data) {
							const result = url.data.startsWith(".")
								? url.data.slice(1)
								: url.data;
							const imageMarkdown = `${value}![${result}](${result})\n`;

							setValue(imageMarkdown);
						}
					} catch (err) {
						console.error("图片上传失败:", err);
					}
					break;
				}
			}
		},
		[setValue, value],
	);
	useEffect(() => {
		const el = editorRef.current;
		if (el) el.addEventListener("paste", handlePaste);
		return () => {
			if (el) el.removeEventListener("paste", handlePaste);
		};
	}, [handlePaste]);

	return (
		<MDEditor
			className={className}
			value={value}
			onChange={(newValue = "") => setValue(newValue)}
			extraCommands={[save, codeEdit, codeLive, codePreview]}
			textareaProps={{
				// @ts-ignore
				onPaste: handlePaste,
				placeholder: "Write your idea down here...",
			}}
			previewOptions={{
				components: {
					code: Code,
				},
			}}
		/>
	);
};
