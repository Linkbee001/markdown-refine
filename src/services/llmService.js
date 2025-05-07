// src/services/llmService.js
// LLM服务：提供统一的LLM配置管理和调用接口
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

/**
 * LLM服务配置 - 从环境变量中读取
 */
export const LLM_CONFIG = {
	// API相关配置
	apiKey: process.env.AI_API_KEY || '',
	baseURL: process.env.AI_BASE_URL || "https://openrouter.ai/api/v1",

	// 模型相关配置
	defaultModel: process.env.AI_DEFAULT_MODEL || "anthropic/claude-3.7-sonnet",
	fallbackModel: process.env.AI_FALLBACK_MODEL || process.env.AI_DEFAULT_MODEL || "anthropic/claude-3-haiku",
	outlineModel: process.env.AI_OUTLINE_MODEL || process.env.AI_DEFAULT_MODEL || "anthropic/claude-3.7-sonnet",

	// 生成参数
	defaultTemperature: parseFloat(process.env.AI_DEFAULT_TEMPERATURE || "0.1"),
	outlineTemperature: parseFloat(process.env.AI_OUTLINE_TEMPERATURE || process.env.AI_DEFAULT_TEMPERATURE || "0.0"),

	// 应用信息
	appName: process.env.NEXT_PUBLIC_APP_NAME || "Markdown Beautifier",
	appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
};

/**
 * 检查是否有有效的API密钥
 * @param {string} customApiKey - 可选的自定义API密钥
 * @returns {boolean} 是否有有效的API密钥
 */
export function hasValidApiKey(customApiKey) {
	return !!(customApiKey || LLM_CONFIG.apiKey);
}

/**
 * 创建LLM实例
 * @param {Object} options - 配置选项
 * @returns {ChatOpenAI} LLM实例
 */
export function createLlmInstance(options = {}) {
	const {
		modelName = LLM_CONFIG.defaultModel,
		temperature = LLM_CONFIG.defaultTemperature,
		customApiKey,
		customBaseURL
	} = options;

	const apiKey = customApiKey || LLM_CONFIG.apiKey;

	if (!apiKey) {
		throw new Error("API Key is required but not provided");
	}

	return new ChatOpenAI({
		modelName,
		temperature,
		apiKey,
		configuration: {
			baseURL: customBaseURL || LLM_CONFIG.baseURL,
			defaultHeaders: {
				"HTTP-Referer": LLM_CONFIG.appUrl,
				"X-Title": LLM_CONFIG.appName,
			},
		},
	});
}

/**
 * 调用LLM服务 - 包装异常处理和结果清理
 * @param {Object} params - 调用参数
 * @returns {Promise<Object>} 结果和可能的错误
 */
export async function invokeLlm(params) {
	const {
		systemPrompt,
		humanPrompt,
		modelOptions = {},
		parseOptions = {
			type: 'text', // 'text', 'json', 'html'
			trimCodeBlocks: true,
		}
	} = params;

	try {
		const llm = createLlmInstance(modelOptions);

		const messages = [];
		if (systemPrompt) {
			messages.push(new SystemMessage(systemPrompt));
		}

		messages.push(new HumanMessage(humanPrompt));
		console.log("调用LLM服务:", messages);
		const response = await llm.invoke(messages);
		let content = response.content;

		// 处理代码块
		if (parseOptions.trimCodeBlocks) {
			// 根据不同的类型匹配不同的代码块
			const blockType = parseOptions.type === 'json' ? 'json' :
				parseOptions.type === 'html' ? 'html' : '';

			const regex = blockType ?
				new RegExp(`^(\`\`\`${blockType}\\s*)|(\\s*\`\`\`)$`, 'g') :
				/^```\w*\s*|\s*```$/g;

			content = content.trim().replace(regex, '').trim();
		}

		// 解析JSON
		if (parseOptions.type === 'json' && content) {
			try {
				const jsonData = JSON.parse(content);
				return { success: true, data: jsonData };
			} catch (parseError) {
				console.error("Error parsing JSON response:", parseError);
				console.error("Raw content:", content);

				// 尝试修复常见的JSON语法错误
				try {
					// 手动进行基本修复尝试
					let fixedContent = content;

					// 修复缺少逗号的常见情况
					fixedContent = fixedContent.replace(/}(\s*){/g, '},\n{');

					// 修复多余逗号的情况
					fixedContent = fixedContent.replace(/,(\s*)}]/g, '\n}]');
					fixedContent = fixedContent.replace(/,(\s*)]}/g, '\n]}');

					// 修复属性值后缺少逗号的情况
					fixedContent = fixedContent.replace(/"([^"]+)"(\s*)"([^"]+)"/g, '"$1",\n"$3"');

					// 如果是数组但没正确结束，添加结束括号
					if (fixedContent.trim().startsWith('[') && !fixedContent.trim().endsWith(']')) {
						fixedContent = fixedContent.trim() + '\n]';
					}

					// 再次尝试解析
					const fixedJsonData = JSON.parse(fixedContent);
					console.log("JSON修复成功！");
					return { success: true, data: fixedJsonData };
				} catch (fixError) {
					// 如果修复失败，提供一个备用空结构，确保流程继续
					console.error("尝试修复JSON失败:", fixError);
					return {
						success: false,
						error: "JSON解析失败，无法修复",
						rawContent: content,
						fallbackData: [] // 提供一个备用空数组
					};
				}
			}
		}

		return { success: true, data: content };
	} catch (error) {
		console.error("LLM调用错误:", error);
		let errorMessage = "LLM调用失败";

		if (error.response) {
			errorMessage += ` 状态: ${error.response.status}. 数据: ${JSON.stringify(error.response.data)}`;
		} else if (error.message) {
			errorMessage += ` 消息: ${error.message}`;
		}

		return { success: false, error: errorMessage };
	}
}

/**
 * 使用LLM优化用户提示词
 * @param {string} originalPrompt - 原始用户提示
 * @param {Object} options - LLM选项
 * @returns {Promise<string>} 优化后的提示词
 */
export async function refinePromptWithLlm(originalPrompt, options = {}) {
	// 导入提示词模板
	const { refineUserPromptSystemPrompt } = await import('../prompts/refineUserPrompt.js');

	const result = await invokeLlm({
		systemPrompt: refineUserPromptSystemPrompt,
		humanPrompt: originalPrompt,
		modelOptions: options
	});

	if (result.success) {
		return result.data;
	} else {
		console.error("优化提示词失败, 将使用原始提示词:", result.error);
		return originalPrompt;
	}
}

/**
 * 使用LLM美化HTML内容
 * @param {string} htmlContent - 要美化的HTML内容
 * @param {string} userPrompt - 用户提供的样式提示
 * @param {boolean} isComponent - 是否为单个组件美化
 * @param {Object} options - LLM选项
 * @returns {Promise<Object>} 美化结果
 */
export async function beautifyHtmlWithLlm(htmlContent, userPrompt, isComponent = false, options = {}) {
	// 导入提示词模板
	const { beautifySystemPromptGenerate } = await import('../prompts/beautifySystemPrompt.js');
	// const { beautifyHtmlLlmAdditionalInstructions } = await import('../prompts/beautifyHtmlLlmInstructions.js');

	// 生成系统提示词
	const componentContext = isComponent ? "You are beautifying a single component only." : "";
	const systemPrompt = await beautifySystemPromptGenerate(userPrompt, componentContext);

	// 构建人类提示词 - 包含HTML内容和附加指令
	const humanPrompt = `${htmlContent}\n\n`;

	// 调用LLM
	return await invokeLlm({
		systemPrompt,
		humanPrompt,
		modelOptions: options,
		parseOptions: {
			type: 'html',
			trimCodeBlocks: true
		}
	});
} 