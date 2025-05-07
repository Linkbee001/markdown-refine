import { NextResponse } from 'next/server';
import {
	LLM_CONFIG,
	refinePromptWithLlm,
	hasValidApiKey
} from '../../../../services/llmService.js';

export async function POST(request) {
	console.log("测试 /api/test/refine_user_prompt...");
	try {
		const { userPrompt } = await request.json();

		if (typeof userPrompt !== 'string' || userPrompt.trim() === "") {
			return NextResponse.json(
				{ error: "请求体中缺少有效的 'userPrompt' 字符串" },
				{ status: 400 }
			);
		}

		if (!hasValidApiKey()) {
			console.log("测试: 服务器端未配置API Key，跳过提示词优化");
			return NextResponse.json(
				{ refinedUserPrompt: userPrompt, error: null, warning: "服务器端未配置API Key，返回原始提示词" },
				{ status: 200 } // 仍然成功，只是未执行优化
			);
		}

		try {
			const refinedPrompt = await refinePromptWithLlm(userPrompt, {
				modelName: LLM_CONFIG.defaultModel,
				temperature: LLM_CONFIG.defaultTemperature
			});

			const wasRefined = refinedPrompt !== userPrompt;
			const responsePayload = { refinedUserPrompt: refinedPrompt, error: null };
			if (!wasRefined) {
				console.warn("测试: 提示词优化未改变原始输入，可能LLM调用失败或无需优化");
				responsePayload.warning = "提示词优化未改变原始输入，可能LLM调用失败或无需优化";
			}
			return NextResponse.json(responsePayload);

		} catch (refineError) {
			console.error("测试: 优化提示词过程中发生意外错误:", refineError);
			return NextResponse.json(
				{ refinedUserPrompt: userPrompt, error: `优化提示词失败: ${refineError.message}` },
				{ status: 500 }
			);
		}

	} catch (error) {
		console.error("测试 refine_user_prompt 整体出错:", error);
		return NextResponse.json(
			{ refinedUserPrompt: "", error: `处理请求出错: ${error.message}` },
			{ status: 500 }
		);
	}
} 