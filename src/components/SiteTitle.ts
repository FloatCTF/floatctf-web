export default function SiteTitle({ title }: { title: string }) {
	document.title = `${title} | FloatCTF`;
}
