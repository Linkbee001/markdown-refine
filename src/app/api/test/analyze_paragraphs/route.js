import { NextResponse } from 'next/server';
import { analyzeParagraphStructureSystemPrompt } from '../../../../prompts/analyzeParagraphStructurePrompt.js';
import {
	LLM_CONFIG,
	invokeLlm,
	hasValidApiKey
} from '../../../../services/llmService.js';

export async function POST(request) {
	console.log("测试 /api/test/analyze_paragraphs...");
	try {
		const { htmlInput } = await request.json();

		if (typeof htmlInput !== 'string') {
			return NextResponse.json(
				{ error: "请求体中缺少有效的 'htmlInput' 字符串" },
				{ status: 400 }
			);
		}
		const result = await invokeLlm({
			systemPrompt: analyzeParagraphStructureSystemPrompt,
			humanPrompt: htmlInput,
			modelOptions: {
				modelName: LLM_CONFIG.defaultModel,
				temperature: LLM_CONFIG.defaultTemperature
			},
			parseOptions: { type: 'html', trimCodeBlocks: true }
		});

		if (!result.success || !result.data) {
			console.warn("测试: LLM段落分析失败:", result.error || "无响应数据");
			return NextResponse.json(
				{ error: `LLM段落分析失败: ${result.error || '无响应数据'}`, analyzedHtml: htmlInput },
				{ status: result.error?.includes("API Key") ? 401 : 502 }
			);
		}

		return NextResponse.json({ analyzedHtml: result.data, error: null });

	} catch (error) {
		console.error("测试 analyze_paragraphs 出错:", error);
		const statusCode = error.message?.includes("API Key") ? 401 : 500;
		return NextResponse.json(
			{ analyzedHtml: "", error: `段落分析出错: ${error.message}` },
			{ status: statusCode }
		);
	}
} 