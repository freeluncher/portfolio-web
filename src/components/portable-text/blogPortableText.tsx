import Link from "next/link";
import Image from "next/image";
import { type PortableTextComponents } from "@portabletext/react";
import type { ReactNode } from "react";
import { urlFor } from "@/sanity/lib/image";

interface PortableImageValue {
	asset?: { _ref?: string };
	alt?: string;
	caption?: string;
}

interface PortableCodeValue {
	filename?: string;
	code?: string;
}

interface PortableTableRow {
	cells: string[];
}

interface PortableTableValue {
	rows?: PortableTableRow[];
}

interface PortableLinkMark {
	href?: string;
	openInNewTab?: boolean;
}

export interface PortableInternalLinkMark {
	refType?: string;
	label?: string;
	fallbackHref?: string;
	slug?: {
		current?: string;
	};
	reference?: {
		slug?: {
			current?: string;
		};
	};
}

interface ChildrenProps {
	children?: ReactNode;
}

export function resolveInternalLinkHref(value?: PortableInternalLinkMark): string | null {
	const slug = value?.slug?.current || value?.reference?.slug?.current;
	if (!slug && !value?.fallbackHref) {
		return null;
	}

	if (slug) {
		return value?.refType === "caseStudy" ? `/projects/${slug}` : `/blog/${slug}`;
	}

	return value?.fallbackHref || null;
}

export function isExternalHref(href: string): boolean {
	return /^https?:\/\//.test(href) || href.startsWith("mailto:") || href.startsWith("tel:");
}

export const blogPortableTextComponents: PortableTextComponents = {
	types: {
		image: ({ value }: { value: PortableImageValue }) => {
			if (!value?.asset?._ref) return null;
			return (
				<div className="my-8 rounded-xl overflow-hidden">
					<Image src={urlFor(value).width(800).url()} alt={value.alt || "Blog image"} width={800} height={400} className="w-full object-cover" />
					{value.caption && <p className="text-center text-sm text-zinc-500 mt-2">{value.caption}</p>}
				</div>
			);
		},
		code: ({ value }: { value: PortableCodeValue }) => {
			return (
				<div className="my-6 rounded-xl overflow-hidden bg-zinc-900 dark:bg-zinc-950">
					{value.filename && <div className="px-4 py-2 bg-zinc-800 text-zinc-400 text-xs font-mono border-b border-zinc-700">{value.filename}</div>}
					<pre className="p-4 overflow-x-auto">
						<code className="text-sm font-mono text-zinc-100">{value.code}</code>
					</pre>
				</div>
			);
		},
		table: ({ value }: { value: PortableTableValue }) => {
			if (!value?.rows) return null;
			return (
				<div className="my-6 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-700">
					<table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
						<tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
							{value.rows.map((row: PortableTableRow, rowIndex: number) => (
								<tr key={rowIndex} className={rowIndex === 0 ? "bg-zinc-100 dark:bg-zinc-800 font-semibold" : ""}>
									{row.cells.map((cell: string, cellIndex: number) => (
										<td key={cellIndex} className="px-4 py-3 text-sm">
											{cell}
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			);
		},
	},
	block: {
		h1: ({ children }: ChildrenProps) => <h1 className="text-3xl font-bold mt-10 mb-5">{children}</h1>,
		h2: ({ children }: ChildrenProps) => <h2 className="text-2xl font-bold mt-8 mb-4">{children}</h2>,
		h3: ({ children }: ChildrenProps) => <h3 className="text-xl font-bold mt-6 mb-3">{children}</h3>,
		h4: ({ children }: ChildrenProps) => <h4 className="text-lg font-semibold mt-4 mb-2">{children}</h4>,
		h5: ({ children }: ChildrenProps) => <h5 className="text-base font-semibold mt-3 mb-2">{children}</h5>,
		h6: ({ children }: ChildrenProps) => <h6 className="text-sm font-semibold mt-3 mb-2 uppercase tracking-wide">{children}</h6>,
		blockquote: ({ children }: ChildrenProps) => <blockquote className="border-l-4 border-blue-500 pl-4 my-4 italic text-zinc-600 dark:text-zinc-400">{children}</blockquote>,
		normal: ({ children }: ChildrenProps) => <p className="mb-4 leading-relaxed">{children}</p>,
	},
	list: {
		bullet: ({ children }: ChildrenProps) => <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>,
		number: ({ children }: ChildrenProps) => <ol className="list-decimal list-inside mb-4 space-y-2">{children}</ol>,
	},
	listItem: {
		bullet: ({ children }: ChildrenProps) => <li className="leading-relaxed">{children}</li>,
		number: ({ children }: ChildrenProps) => <li className="leading-relaxed">{children}</li>,
	},
	marks: {
		link: ({ children, value }: { children?: ReactNode; value?: PortableLinkMark }) => (
			<a href={value?.href || "#"} target={value?.openInNewTab === false ? undefined : "_blank"} rel={value?.openInNewTab === false ? undefined : "noopener noreferrer"} className="text-blue-500 hover:underline">
				{children}
			</a>
		),
		internalLink: ({ children, value }: { children?: ReactNode; value?: PortableInternalLinkMark }) => {
			const href = resolveInternalLinkHref(value);
			if (!href) return <>{children}</>;

			if (isExternalHref(href)) {
				return (
					<a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline" title={value?.label || undefined}>
						{children}
					</a>
				);
			}

			return (
				<Link href={href} className="text-blue-500 hover:underline" title={value?.label || undefined}>
					{children}
				</Link>
			);
		},
		code: ({ children }: ChildrenProps) => <code className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-sm">{children}</code>,
		strong: ({ children }: ChildrenProps) => <strong className="font-bold">{children}</strong>,
		em: ({ children }: ChildrenProps) => <em className="italic">{children}</em>,
		underline: ({ children }: ChildrenProps) => <span className="underline">{children}</span>,
		"strike-through": ({ children }: ChildrenProps) => <span className="line-through">{children}</span>,
	},
};
