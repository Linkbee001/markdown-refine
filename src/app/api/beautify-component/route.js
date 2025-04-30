// src/app/api/beautify-component/route.js
// 用于重新美化选中的单个组件
import { NextResponse } from 'next/server';
import {
	LLM_CONFIG,
	invokeLlm,
	hasValidApiKey,
	beautifyHtmlWithLlm
} from '../../../services/llmService.js';
import {
	extractComponentHtml,
	replaceComponentInHtml,
	validateAndFixComponentHtml
} from '../../../services/htmlService.js';

// 导入提取出来的 prompts
import { beautifySystemPromptGenerate } from '../../../prompts/beautifySystemPrompt.js';
import { beautifyHtmlLlmAdditionalInstructions } from '../../../prompts/beautifyHtmlLlmInstructions.js';
import { refineUserPromptSystemPrompt } from '../../../prompts/refineUserPrompt.js';

/**
 * 美化单个组件
 */
async function beautifyComponent(fullHtml, componentId, userPrompt, apiKey) {
	console.log(`开始美化组件[${componentId}]...`);

	// 1. 提取组件HTML
	const extractResult = await extractComponentHtml(fullHtml, componentId);
	console.log("[beautifyComponent] extractResult:", extractResult);

	if (!extractResult.success) {
		return {
			success: false,
			error: extractResult.error,
			html: fullHtml // 返回原始HTML
		};
	}

	const { componentHtml } = extractResult;

	// 如果没有提供提示词或API密钥，则跳过美化
	if (!userPrompt) {
		console.warn("未提供美化提示词，跳过组件美化");
		return {
			success: true,
			html: fullHtml,
			warning: "未提供美化提示词，组件保持原样"
		};
	}

	if (!hasValidApiKey(apiKey)) {
		console.error("未提供API密钥，无法美化组件");
		return {
			success: false,
			error: "美化组件失败：未提供API密钥",
			html: fullHtml
		};
	}

	// 2. 使用LLM美化组件
	const beautifyResult = await beautifyHtmlWithLlm(
		componentHtml,
		userPrompt,
		true, // 这是组件美化
		{
			customApiKey: apiKey,
			modelName: LLM_CONFIG.defaultModel,
			temperature: LLM_CONFIG.defaultTemperature
		}
	);
	console.log("[beautifyComponent] beautifyResult (from LLM):", beautifyResult);

	if (!beautifyResult.success) {
		console.error("美化组件失败:", beautifyResult.error);
		return {
			success: false,
			error: `美化组件失败: ${beautifyResult.error}`,
			html: fullHtml
		};
	}

	// 3. 验证和修复AI生成的HTML，确保ID和标签一致性
	const validatedHtml = validateAndFixComponentHtml(beautifyResult.data, componentHtml);
	console.log("[beautifyComponent] validatedHtml:", validatedHtml);

	// 4. 替换组件
	const replaceResult = await replaceComponentInHtml(
		fullHtml,
		componentId,
		validatedHtml // 使用修复后的 HTML
	);
	console.log("[beautifyComponent] replaceResult:", replaceResult);

	if (!replaceResult.success) {
		console.error("替换组件失败:", replaceResult.error);
		return {
			success: false,
			error: replaceResult.error,
			html: fullHtml // 替换失败也返回原始 HTML
		};
	}

	// 5. 准备最终结果
	const finalResult = {
		success: true,
		html: replaceResult.updatedHtml
	};
	console.log("[beautifyComponent] finalResult to return:", finalResult);
	return finalResult;
}

/**
 * API路由处理程序
 */
export async function POST(request) {
	console.log("处理组件美化请求...");

	try {
		// 解析请求体
		const requestData = await request.json();
		const {
			html,
			componentId,
			prompt = "",
			apiKey = ""
		} = requestData;
		console.log("[POST /api/beautify-component] Received data:", { htmlLength: html?.length, componentId, prompt, hasApiKey: !!apiKey });

		if (!html || !componentId) {
			return Response.json(
				{ error: "请求中缺少HTML内容或组件ID" },
				{ status: 400 }
			);
		}

		// 美化组件
		const result = await beautifyComponent(html, componentId, prompt, apiKey);
		console.log("[POST /api/beautify-component] Result from beautifyComponent:", result);

		if (!result.success) {
			console.error("组件美化失败:", result.error);
			return Response.json(
				{
					error: result.error,
					html: result.html // 返回原始HTML以帮助调试
				},
				{ status: 500 }
			);
		}

		// 返回成功结果
		const responsePayload = {
			html: result.html,
			...(result.warning ? { warning: result.warning } : {})
		};
		console.log("[POST /api/beautify-component] Sending success response payload:", { htmlLength: responsePayload.html?.length, warning: responsePayload.warning });
		return Response.json(responsePayload);

	} catch (error) {
		console.error("处理组件美化请求出错:", error);
		return Response.json(
			{ error: `服务器错误: ${error.message}` },
			{ status: 500 }
		);
	}
} 