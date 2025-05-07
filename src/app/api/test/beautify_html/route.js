import { NextResponse } from 'next/server';
import {
	LLM_CONFIG,
	beautifyHtmlWithLlm,
	hasValidApiKey
} from '../../../../services/llmService.js';

export async function POST(request) {
	console.log("测试 /api/test/beautify_html...");
	try {
		const { htmlInput, prompt = "" } = await request.json();

		if (typeof htmlInput !== 'string') {
			return NextResponse.json(
				{ error: "请求体中缺少有效的 'htmlInput' 字符串" },
				{ status: 400 }
			);
		}

		if (!prompt.trim()) {
			console.warn("测试: 未提供美化提示词，将返回原始HTML");
			return NextResponse.json(
				{ styledHtml: htmlInput, error: null, warning: "未提供提示词，返回原始HTML" },
				{ status: 200 }
			);
		}

		if (!hasValidApiKey()) {
			console.error("测试: 服务器端未配置API Key，无法执行美化");
			return NextResponse.json(
				{ error: "美化失败：服务器端未配置有效的 API Key", styledHtml: htmlInput },
				{ status: 401 } // Unauthorized
			);
		}

		try {
			const result = await beautifyHtmlWithLlm(
				htmlInput,
				prompt,
				false, // 不是组件美化
				{
					modelName: LLM_CONFIG.defaultModel,
					temperature: LLM_CONFIG.defaultTemperature
				}
			);

			if (!result.success) {
				console.error("测试: 美化HTML失败:", result.error);
				return NextResponse.json(
					{ error: `美化失败: ${result.error}`, styledHtml: htmlInput },
					{ status: 502 } // Bad Gateway (from upstream LLM)
				);
			}

			return NextResponse.json({ styledHtml: result.data, error: null });

		} catch (beautifyError) {
			console.error("测试: 美化过程出错:", beautifyError);
			return NextResponse.json(
				{ error: `美化过程出错: ${beautifyError.message}`, styledHtml: htmlInput },
				{ status: 500 }
			);
		}

	} catch (error) {
		console.error("测试 beautify_html 整体出错:", error);
		const statusCode = error.message?.includes("API Key") ? 401 : 500;
		return NextResponse.json(
			{ styledHtml: "", error: `处理请求出错: ${error.message}` },
			{ status: statusCode }
		);
	}
} 