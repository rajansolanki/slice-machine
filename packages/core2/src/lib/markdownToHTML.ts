import type { Plugin, Processor } from "unified";
import type { Root, ElementContent } from "hast";
import { createStarryNight, common, Grammar } from "@wooorm/starry-night";
import tsxGrammar from "@wooorm/starry-night/lang/source.tsx";
import { visit } from "unist-util-visit";
import { toString } from "hast-util-to-string";

type RehypeStarryNightOptions = {
	grammars?: Grammar[];
};

/**
 * Rehype plugin to highlight code with `starry-night`.
 *
 * Adapted from:
 * https://github.com/wooorm/starry-night/tree/c73aac7b8bff41ada86747f668dd932a791b851b#example-integrate-with-unified-remark-and-rehype
 */
const rehypeStarryNight: Plugin<[options?: RehypeStarryNightOptions], Root> = (
	options = {},
) => {
	const grammars = options.grammars || [...common, tsxGrammar];
	const starryNightPromise = createStarryNight(grammars);
	const prefix = "language-";

	return async (tree) => {
		const starryNight = await starryNightPromise;

		visit(tree, "element", function (node, index, parent) {
			if (!parent || index === null || node.tagName !== "pre") {
				return;
			}

			const head = node.children[0];

			if (
				!head ||
				head.type !== "element" ||
				head.tagName !== "code" ||
				!head.properties
			) {
				return;
			}

			const classes = head.properties.className;

			if (!Array.isArray(classes)) {
				return;
			}

			const language = classes.find(
				(d) => typeof d === "string" && d.startsWith(prefix),
			);

			if (typeof language !== "string") {
				return;
			}

			const scope = starryNight.flagToScope(language.slice(prefix.length));

			// Maybe warn?
			if (!scope) {
				return;
			}

			const fragment = starryNight.highlight(toString(head), scope);
			const children = fragment.children as ElementContent[];

			parent.children.splice(index, 1, {
				type: "element",
				tagName: "div",
				properties: {
					className: [
						"highlight",
						"highlight-" + scope.replace(/^source\./, "").replace(/\./g, "-"),
					],
				},
				children: [
					{ type: "element", tagName: "pre", properties: {}, children },
				],
			});
		});
	};
};

let processor: Processor;

export const markdownToHTML = async (markdown: string): Promise<string> => {
	if (!processor) {
		const { unified } = await import("unified");
		const remarkParse = await import("remark-parse");
		const remarkGfm = await import("remark-gfm");
		const remarkRehype = await import("remark-rehype");
		const rehypeStringify = await import("rehype-stringify");

		processor = unified()
			.use(remarkParse.default)
			.use(remarkGfm.default)
			.use(remarkRehype.default)
			.use(rehypeStarryNight)
			.use(rehypeStringify.default);
	}

	const virtualFile = await processor.process(markdown);

	return virtualFile.toString();
};