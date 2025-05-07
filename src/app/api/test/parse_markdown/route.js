import { marked } from "marked";
import { JSDOM } from "jsdom";
import { addComponentClassesToHtml } from '../../../../services/htmlService.js';
import { NextResponse } from 'next/server';

export async function POST(request) {
	console.log("测试 /api/test/parse_markdown...");
	try {
		const { markdown } = await request.json();

		if (typeof markdown !== 'string') {
			return NextResponse.json(
				{ error: "请求体中缺少有效的 'markdown' 字符串" },
				{ status: 400 }
			);
		}

		// 1. 使用marked解析Markdown为HTML
		const initialHtml = marked.parse(markdown);

		// 2. 使用JSDOM和addComponentClassesToHtml添加基础类名
		// 注意：这里我们直接处理body内容，而不是创建完整文档
		// const dom = new JSDOM(`<!DOCTYPE html><html><body>${initialHtml}</body></html>`);
		// const htmlWithClasses = addComponentClassesToHtml(initialHtml); // 直接处理片段

		return NextResponse.json({ htmlResult: initialHtml, error: null });

	} catch (error) {
		console.error("测试 parse_markdown 出错:", error);
		return NextResponse.json(
			{ htmlResult: "", error: `解析Markdown出错: ${error.message}` },
			{ status: 500 }
		);
	}
} 