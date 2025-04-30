// edit_file: src/app/api/beautify/route.js
// instructions: 我将创建一个通用的LLM服务函数并重构代码，以便统一配置和调用AI模型，同时支持通过环境变量配置模型参数
import { marked } from "marked";
import { JSDOM } from "jsdom";
import { StateGraph } from "@langchain/langgraph";
import { END } from "@langchain/langgraph";
import { analyzeParagraphStructureSystemPrompt } from '../../../prompts/analyzeParagraphStructurePrompt.js';
import { generateDocumentOutlineSystemPrompt } from '../../../prompts/generateDocumentOutlinePrompt.js';
import {
	LLM_CONFIG,
	invokeLlm,
	hasValidApiKey,
	refinePromptWithLlm,
	beautifyHtmlWithLlm
} from '../../../services/llmService.js';
import {
	addComponentClassesToHtml,
	createBasicOutlineFromHtml
} from '../../../services/htmlService.js';
import { NextResponse } from 'next/server';
// Use relative paths for imports within the API route
import { beautifySystemPromptGenerate } from '../../../prompts/beautifySystemPrompt.js';
// 删除重复导入的JSDOM
// import jsdom from 'jsdom'; // 需要安装 jsdom: npm install jsdom 或 yarn add jsdom
// const { JSDOM } = jsdom;

// 导入提取出来的 prompts (使用相对路径)
import { beautifyHtmlLlmAdditionalInstructions } from '../../../prompts/beautifyHtmlLlmInstructions.js';
import { refineUserPromptSystemPrompt } from '../../../prompts/refineUserPrompt.js';

/**
 * 将Markdown解析为HTML并进行初步处理
 */
async function parseMarkdown({ state }) {
	const { markdown } = state;
	console.log("解析Markdown为HTML...");
	console.log("parseMarkdown received markdown:", markdown);

	if (!markdown || typeof markdown !== 'string') {
		return {
			state: {
				...state,
				error: "未提供有效的Markdown内容",
				htmlResult: "",
			}
		};
	}

	try {
		// 使用marked解析Markdown为HTML
		const initialHtml = marked.parse(markdown);
		// 创建一个基本的HTML文档
		const dom = new JSDOM(`<!DOCTYPE html><html><body>${initialHtml}</body></html>`);

		// 使用htmlService添加更多特定组件的类名
		const htmlWithClasses = addComponentClassesToHtml(dom.window.document.body.innerHTML);

		return {
			state: {
				...state,
				htmlResult: htmlWithClasses,
				rawHtml: htmlWithClasses,
				error: null
			}
		};
	} catch (error) {
		console.error("解析Markdown出错:", error);
		return {
			state: {
				...state,
				error: `解析Markdown出错: ${error.message}`,
				htmlResult: "",
			}
		};
	}
}

/**
 * 使用LLM分析HTML的段落结构并添加更详细的类
 */
async function analyzeParagraphStructure({ state, apiKey }) {
	console.log("分析段落结构...");

	if (state.error || !state.htmlResult) {
		console.warn("跳过段落分析，因为前一步骤出错或HTML为空");
		return { state };
	}

	try {
		const { htmlResult } = state;

		const result = await invokeLlm({
			systemPrompt: analyzeParagraphStructureSystemPrompt,
			humanPrompt: htmlResult,
			modelOptions: {
				customApiKey: apiKey,
				modelName: LLM_CONFIG.defaultModel,
				temperature: LLM_CONFIG.defaultTemperature
			},
			parseOptions: { type: 'html', trimCodeBlocks: true }
		});

		if (!result.success || !result.data) {
			console.warn("LLM段落分析失败:", result.error || "无响应数据");
			return { state };
		}

		return {
			state: {
				...state,
				htmlResult: result.data,
				analyzedHtml: result.data,
			}
		};
	} catch (error) {
		console.error("段落分析出错:", error);
		return {
			state: {
				...state,
				warning: state.warning ? `${state.warning}\n段落分析出错: ${error.message}` : `段落分析出错: ${error.message}`
			}
		};
	}
}

/**
 * 使用LLM生成文档大纲
 */
async function generateDocumentOutline({ state, apiKey }) {
	console.log("生成文档大纲...");

	if (state.error || !state.htmlResult) {
		console.warn("跳过大纲生成，因为前一步骤出错或HTML为空");
		return { state };
	}

	try {
		// 首先尝试使用LLM生成大纲
		if (hasValidApiKey(apiKey)) {
			// 使用专为大纲生成配置的模型
			const result = await invokeLlm({
				systemPrompt: generateDocumentOutlineSystemPrompt,
				humanPrompt: state.htmlResult,
				modelOptions: {
					customApiKey: apiKey,
					modelName: LLM_CONFIG.outlineModel || LLM_CONFIG.defaultModel,
					temperature: LLM_CONFIG.outlineTemperature
				},
				parseOptions: { type: 'json', trimCodeBlocks: true }
			});

			if (result.success && Array.isArray(result.data) && result.data.length > 0) {
				return {
					state: {
						...state,
						documentOutline: result.data,
					}
				};
			}

			console.warn("LLM大纲生成失败或返回空结果，将使用基础大纲生成");
		} else {
			console.log("未提供API密钥，使用基础大纲生成");
		}

		// 如果LLM生成失败或没有API密钥，使用基础大纲生成
		const outlineResult = createBasicOutlineFromHtml(state.htmlResult);

		return {
			state: {
				...state,
				documentOutline: outlineResult.outline,
			}
		};
	} catch (error) {
		console.error("生成大纲出错:", error);

		// 发生错误时，尝试生成最基本的大纲
		try {
			const basicOutline = createBasicOutlineFromHtml(state.htmlResult);
			return {
				state: {
					...state,
					documentOutline: basicOutline.outline,
					warning: `大纲生成过程中出错: ${error.message}，使用了基础大纲`,
				}
			};
		} catch (fallbackError) {
			// 如果连基本大纲都无法生成，返回空数组
			return {
				state: {
					...state,
					documentOutline: [],
				}
			};
		}
	}
}

/**
 * 使用LLM优化用户提示词
 */
async function refineUserPrompt({ state, apiKey, userPrompt }) {
	console.log("优化用户提示词...");

	if (!userPrompt || !hasValidApiKey(apiKey)) {
		console.log("跳过提示词优化：", !userPrompt ? "未提供提示词" : "未提供API密钥");
		return {
			state: {
				...state,
				userPrompt: userPrompt || "",
			}
		};
	}

	try {
		const refinedPrompt = await refinePromptWithLlm(userPrompt, {
			customApiKey: apiKey,
			modelName: LLM_CONFIG.defaultModel,
			temperature: LLM_CONFIG.defaultTemperature
		});

		return {
			state: {
				...state,
				userPrompt,
				refinedUserPrompt: refinedPrompt,
			}
		};
	} catch (error) {
		console.error("优化提示词出错:", error);
		return {
			state: {
				...state,
				userPrompt,
			}
		};
	}
}

/**
 * 使用LLM美化HTML
 */
async function beautifyHtml({ state, apiKey }) {
	console.log("美化HTML...");

	if (state.error || !state.htmlResult) {
		console.warn("跳过HTML美化，因为前一步骤出错或HTML为空");
		return {
			state: {
				...state,
				finalHtml: "", // 确保finalHtml存在但为空
			}
		};
	}

	try {
		// 使用经过优化的提示词（如果可用）
		const promptToUse = state.refinedUserPrompt || state.userPrompt || "";

		if (!promptToUse) {
			console.warn("未提供美化提示词");
			// 无提示词时，直接进入最终化步骤
			return {
				state: {
					...state,
					styledHtml: state.htmlResult,
				}
			};
		}

		if (!hasValidApiKey(apiKey)) {
			return {
				state: {
					...state,
					error: "美化失败：未提供API密钥",
				}
			};
		}

		// 调用美化服务
		const result = await beautifyHtmlWithLlm(
			state.htmlResult,
			promptToUse,
			false, // 不是组件美化
			{
				customApiKey: apiKey,
				modelName: LLM_CONFIG.defaultModel,
				temperature: LLM_CONFIG.defaultTemperature
			}
		);

		if (!result.success) {
			console.error("美化HTML失败:", result.error);
			return {
				state: {
					...state,
					error: `美化失败: ${result.error}`,
				}
			};
		}

		return {
			state: {
				...state,
				styledHtml: result.data,
			}
		};
	} catch (error) {
		console.error("美化过程出错:", error);
		return {
			state: {
				...state,
				error: `美化过程出错: ${error.message}`,
			}
		};
	}
}

/**
 * 最终化HTML文档
 */
function finalizeHtmlDocument({ state }) {
	console.log("最终化HTML文档...");
	console.log("Finalize Input State:", {
		styledHtmlLength: state.styledHtml?.length,
		analyzedHtmlLength: state.analyzedHtml?.length,
		htmlResultLength: state.htmlResult?.length,
		error: state.error
	});

	if (state.error) {
		console.warn("最终化时有错误:", state.error);
		// 即使有错误也尝试返回某些内容
	}

	const htmlToFinalize = state.styledHtml || state.analyzedHtml || state.htmlResult || "";

	// 如果没有可用的HTML，返回错误
	if (!htmlToFinalize) {
		console.warn("没有可用于最终化的HTML内容");
		return {
			state: {
				...state,
				finalHtml: "",
				error: state.error || "未生成任何HTML内容", // 设置错误
			}
		};
	}

	try {
		// 创建完整的HTML文档
		const finalHtml = `<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<style>
		/* 基础样式 */
		body {
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
			line-height: 1.6;
			color: #333;
			max-width: 900px;
			margin: 0 auto;
			padding: 20px;
		}
		
		/* 暗黑模式支持 */
		@media (prefers-color-scheme: dark) {
			body {
				background-color: #121212;
				color: #e0e0e0;
			}
			a {
				color: #90caf9;
			}
		}
	</style>
</head>
<body>
${htmlToFinalize}
</body>
</html>`;

		console.log("成功生成 finalHtml");
		return {
			state: {
				...state,
				finalHtml: finalHtml.trim(),
			}
		};
	} catch (error) {
		console.error("最终化HTML文档出错:", error);
		return {
			state: {
				...state,
				finalHtml: `<html><body><h1>Error</h1><p>${state.error || error.message}</p></body></html>`, // 提供备用HTML
				error: `最终化HTML文档出错: ${error.message}`, // 设置错误
			}
		};
	}
}

// 定义状态图
const workflow = new StateGraph({
	channels: {
		state: {
			markdown: "",
			htmlResult: "",
			userPrompt: "",
			refinedUserPrompt: "",
			documentOutline: [],
			styledHtml: "",
			finalHtml: "",
			error: null,
		},
		apiKey: null,
		userPrompt: "",
	},
});

// 添加节点
workflow.addNode("parse_markdown", parseMarkdown);
workflow.addNode("analyze_paragraphs", analyzeParagraphStructure);
workflow.addNode("generate_outline", generateDocumentOutline);
workflow.addNode("refine_user_prompt", refineUserPrompt);
workflow.addNode("beautify_html", beautifyHtml);
workflow.addNode("finalize_html", finalizeHtmlDocument);

// 设置入口点
workflow.setEntryPoint("parse_markdown");

// 设置节点顺序
workflow.addEdge("parse_markdown", "analyze_paragraphs");
workflow.addEdge("analyze_paragraphs", "generate_outline");
workflow.addEdge("generate_outline", "refine_user_prompt");
workflow.addEdge("refine_user_prompt", "beautify_html");
workflow.addEdge("beautify_html", "finalize_html");
workflow.addEdge("finalize_html", END);

// 编译状态图
const graph = workflow.compile();

/**
 * POST处理程序
 */
export async function POST(request) {
	console.log("处理美化请求...");

	try {
		// 解析请求体
		const requestData = await request.json();
		const { markdown, prompt = "", apiKey = "" } = requestData;

		if (!markdown) {
			return Response.json(
				{ error: "请求中缺少Markdown内容" },
				{ status: 400 }
			);
		}

		// 运行工作流
		const result = await graph.invoke({
			state: { markdown: markdown.trim() },
			apiKey: apiKey,
			userPrompt: prompt.trim(),
		});

		const { finalHtml, documentOutline, error, warning } = result.state;
		console.log("Workflow Final State:", {
			hasFinalHtml: !!finalHtml,
			finalHtmlLength: finalHtml?.length,
			outlineLength: documentOutline?.length,
			error: error,
			warning: warning
		});

		// 情况1：有致命错误且无最终HTML
		if (error && !finalHtml) {
			console.error("处理失败 (Fatal Error & No HTML):", error);
			return Response.json(
				{ error: `处理失败: ${error}` },
				{ status: 500 }
			);
		}

		// 情况2：没有致命错误，但 finalHtml 缺失或为空
		if (!finalHtml) {
			console.error("处理失败 (Missing finalHtml): Final state did not contain finalHtml.");
			const errorMessage = warning ? `API 响应缺少必要的数据 (finalHtml)。警告: ${warning}` : "API 响应缺少必要的数据 (finalHtml)";
			return Response.json(
				{ error: errorMessage },
				{ status: 500 }
			);
		}

		// 情况3：成功，finalHtml 存在
		const responsePayload = {
			finalHtml: finalHtml,
			documentOutline: documentOutline || [], // 大纲可以为空
		};
		if (error) { // 如果 finalHtml 存在但仍有错误，作为警告返回
			console.warn("处理完成但有错误(作为警告返回):", error);
			responsePayload.warning = `处理完成但有错误: ${error}`;
		} else if (warning) { // 如果没有错误但有警告
			console.warn("处理完成但有警告:", warning);
			responsePayload.warning = warning;
		}

		console.log("成功返回响应");
		return Response.json(responsePayload);

	} catch (error) {
		console.error("处理请求时发生意外错误:", error);
		return Response.json(
			{ error: `服务器意外错误: ${error.message}` },
			{ status: 500 }
		);
	}
}