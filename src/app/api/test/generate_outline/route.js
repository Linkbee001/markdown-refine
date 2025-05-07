import { NextResponse } from 'next/server';
import { generateDocumentOutlineSystemPrompt } from '../../../../prompts/generateDocumentOutlinePrompt.js';
import {
	LLM_CONFIG,
	invokeLlm,
	hasValidApiKey
} from '../../../../services/llmService.js';
import { createBasicOutlineFromHtml } from '../../../../services/htmlService.js';

export async function POST(request) {
	console.log("测试 /api/test/generate_outline...");
	try {
		const { htmlInput } = await request.json();

		if (typeof htmlInput !== 'string') {
			return NextResponse.json(
				{ error: "请求体中缺少有效的 'htmlInput' 字符串" },
				{ status: 400 }
			);
		}

		let documentOutline = [];
		let warning = null;
		let llmAttempted = false;
		let llmErrorOccurred = false;

		// 检查服务器端是否有配置API Key
		const serverHasApiKey = hasValidApiKey();

		// 尝试使用LLM生成大纲 (如果服务器端有配置API Key)
		if (serverHasApiKey) {
			llmAttempted = true;
			try {
				const result = await invokeLlm({
					systemPrompt: generateDocumentOutlineSystemPrompt,
					humanPrompt: htmlInput,
					modelOptions: {
						modelName: LLM_CONFIG.outlineModel || LLM_CONFIG.defaultModel,
						temperature: LLM_CONFIG.outlineTemperature
					},
					parseOptions: { type: 'json', trimCodeBlocks: true }
				});

				if (result.success && Array.isArray(result.data) && result.data.length > 0) {
					documentOutline = result.data;
				} else {
					llmErrorOccurred = true;
					warning = `LLM大纲生成失败或返回空结果 (${result.error || 'no data'})，将使用基础大纲生成`;
					console.warn("测试: " + warning);
				}
			} catch (llmError) {
				llmErrorOccurred = true;
				warning = `LLM大纲生成过程中出错: ${llmError.message}，将使用基础大纲生成`;
				console.error("测试: LLM大纲生成出错: ", llmError);
			}
		} else {
			console.log("测试: 服务器端未配置API密钥，使用基础大纲生成");
			warning = "服务器端未配置API密钥，使用基础大纲生成";
		}

		// 如果LLM未尝试、尝试失败或结果为空，则使用基础方法
		if (!llmAttempted || llmErrorOccurred || documentOutline.length === 0) {
			try {
				const outlineResult = createBasicOutlineFromHtml(htmlInput);
				documentOutline = outlineResult.outline;
				if (outlineResult.error) {
					console.warn("测试: 基础大纲生成时有错误: ", outlineResult.error);
					// 可以选择是否将基础方法的错误附加到warning
					const basicErrorWarning = `基础大纲生成错误: ${outlineResult.error}`;
					warning = warning ? `${warning}\n${basicErrorWarning}` : basicErrorWarning;
				}
			} catch (basicOutlineError) {
				console.error("测试: 基础大纲生成出错: ", basicOutlineError);
				return NextResponse.json(
					{ documentOutline: [], error: `基础大纲生成失败: ${basicOutlineError.message}` },
					{ status: 500 }
				);
			}
		}

		// 最终返回结果，可能带有警告信息
		const responsePayload = { documentOutline, error: null };
		if (warning) {
			responsePayload.warning = warning;
		}
		return NextResponse.json(responsePayload);

	} catch (error) {
		console.error("测试 generate_outline 整体出错:", error);
		return NextResponse.json(
			{ documentOutline: [], error: `生成大纲出错: ${error.message}` },
			{ status: 500 }
		);
	}
} 