// edit_file: src/app/api/beautify/route.js
// instructions: 我将创建一个通用的LLM服务函数并重构代码，以便统一配置和调用AI模型，同时支持通过环境变量配置模型参数
import { StateGraph, END } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { marked } from "marked";
import { NextResponse } from 'next/server';
// Use relative paths for imports within the API route
import { beautifySystemPromptGenerate } from '../../../prompts/beautifySystemPrompt.js';
// Node.js 环境中解析 HTML 需要库
import jsdom from 'jsdom'; // 需要安装 jsdom: npm install jsdom 或 yarn add jsdom
const { JSDOM } = jsdom;

// 导入提取出来的 prompts (使用相对路径)
import { analyzeParagraphStructureSystemPrompt } from '../../../prompts/analyzeParagraphStructurePrompt.js';
import { generateDocumentOutlineSystemPrompt } from '../../../prompts/generateDocumentOutlinePrompt.js';
import { beautifyHtmlLlmAdditionalInstructions } from '../../../prompts/beautifyHtmlLlmInstructions.js';

// --- LLM 服务配置和工具函数 ---

/**
 * LLM服务配置 - 从环境变量中读取
 */
const LLM_CONFIG = {
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
 * 创建LLM实例
 * @param {Object} options - 配置选项
 * @returns {ChatOpenAI} LLM实例
 */
function createLlmInstance(options = {}) {
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
async function invokeLlm(params) {
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
				return {
					success: false,
					error: "JSON解析失败",
					rawContent: content
				};
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

// --- Helper Functions ---

// 注意：这个函数现在在后端使用了 JSDOM
function addComponentClassesToHtml(html) {
	try {
		const dom = new JSDOM(html);
		const doc = dom.window.document;

		// 为日期文本添加类名
		const paragraphs = doc.querySelectorAll('p');
		paragraphs.forEach(p => {
			// 日期格式检测 (如 2024.11.6/星期二)
			if (/\d{4}\.\d{1,2}\.\d{1,2}(\/星期[一二三四五六日])?/.test(p.textContent)) {
				p.classList.add('date-component');
			}
		});

		// 为结尾标记添加类名
		const endingElements = doc.querySelectorAll('p, strong');
		endingElements.forEach(el => {
			if (el.textContent.trim() === 'END') {
				el.classList.add('ending-component');
			}
		});

		// 给所有可识别的顶层块级元素添加唯一ID，用于大纲和前端交互
		const bodyElements = doc.body.children;
		Array.from(bodyElements).forEach((el, index) => {
			// 确保有ID且唯一，如果已有ID则保留
			if (!el.id) {
				el.id = `component-${index + 1}`;
			}
			// 确保段落有 paragraph-component 类 (analyzeParagraphStructure 可能已添加)
			if (el.tagName === 'P' && !el.classList.contains('paragraph-component')) {
				// 在这里添加可能不太合适，应该依赖 analyzeParagraphStructure 节点
				// 但作为后备可以考虑，或在 analyzeParagraphStructure 中确保添加 ID
			}
		});


		return doc.body.innerHTML;
	} catch (error) {
		console.error("Error adding component classes with JSDOM:", error);
		return html; // 出错时返回原始 HTML
	}
}


// --- LangGraph Nodes ---

// Node 1: Parse Markdown to basic HTML
async function parseMarkdown(state) {
	console.log("--- API: PARSING MARKDOWN ---");
	try {
		const html = await marked.parse(state.originalMarkdown);
		const sanitizedHtml = html.replace(/<script.*?>.*?<\/script>/gi, '');

		// 在此初步添加组件类和ID，主要为了后续节点处理
		const htmlWithClasses = addComponentClassesToHtml(sanitizedHtml);

		return { basicHtml: htmlWithClasses };
	} catch (error) {
		console.error("API Error parsing Markdown:", error);
		return { error: `Markdown parsing failed: ${error.message}` };
	}
}

// Node 2: 分析内容并添加段落标记
async function analyzeParagraphStructure(state) {
	console.log("--- API: ANALYZING PARAGRAPH STRUCTURE ---");
	if (state.error) return { error: state.error }; // Pass through previous errors
	if (!state.basicHtml) {
		return { error: "Cannot analyze: No HTML content available." };
	}

	if (!LLM_CONFIG.apiKey) {
		console.warn("API Warning: No API Key is set. Skipping paragraph structure analysis.");
		// 如果没有API Key，无法调用LLM分析，但仍需确保有基础结构，至少返回输入
		return { paragraphHtml: state.basicHtml };
	}

	const result = await invokeLlm({
		systemPrompt: analyzeParagraphStructureSystemPrompt,
		humanPrompt: `这是需要分析并添加段落结构和ID的HTML内容:
\`\`\`html
${state.basicHtml}
\`\`\`

请严格按照指示处理，确保所有内容块都有 \`paragraph-component\` 类和唯一的 \`id\`。`,
		parseOptions: { type: 'html', trimCodeBlocks: true },
	});

	if (!result.success) {
		console.warn("API: LLM failed to analyze paragraph structure, using original HTML with basic classes.");
		return { paragraphHtml: state.basicHtml };
	}

	const paragraphHtml = result.data;

	if (!paragraphHtml) {
		console.warn("API: LLM returned empty content for paragraph analysis. Using basic HTML.");
		return { paragraphHtml: state.basicHtml };
	}

	// 尝试用 JSDOM 验证并添加 ID (作为LLM输出的补充)
	try {
		const dom = new JSDOM(`<body>${paragraphHtml}</body>`);
		const doc = dom.window.document;
		const bodyElements = doc.body.children;
		let idCounter = 1;
		Array.from(bodyElements).forEach((el) => {
			if (!el.id) {
				el.id = `component-${idCounter++}`;
			}
			// 确保 paragraph-component 类存在
			if (!el.classList.contains('paragraph-component')) {
				console.warn(`Element ${el.tagName}#${el.id} missing paragraph-component class after LLM analysis. Adding it.`);
				el.classList.add('paragraph-component');
			}
		});
		const verifiedHtml = doc.body.innerHTML;
		console.log("--- API: Verified Paragraph HTML Structure ---");
		return { paragraphHtml: verifiedHtml };
	} catch (domError) {
		console.error("API Error verifying/cleaning paragraph HTML with JSDOM:", domError);
		return { paragraphHtml: paragraphHtml }; // Use LLM output directly if JSDOM fails
	}
}


// Node 3: (新) 生成文档大纲
async function generateDocumentOutline(state) {
	console.log("--- API: GENERATING DOCUMENT OUTLINE ---");
	if (state.error) return { error: state.error };
	if (!state.paragraphHtml) {
		return { error: "Cannot generate outline: No paragraph HTML available." };
	}

	// 如果没有API Key，我们无法生成大纲，可以选择返回空大纲或错误
	if (!LLM_CONFIG.apiKey) {
		console.warn("API Warning: No API Key is set. Skipping outline generation.");
		return { documentOutline: [] }; // 返回空数组表示没有大纲
	}

	const result = await invokeLlm({
		systemPrompt: generateDocumentOutlineSystemPrompt,
		humanPrompt: `请根据以下HTML内容生成文档大纲JSON:
\`\`\`html
${state.paragraphHtml}
\`\`\`
请确保输出是严格符合要求的JSON数组。`,
		modelOptions: {
			modelName: LLM_CONFIG.outlineModel,
			temperature: LLM_CONFIG.outlineTemperature
		},
		parseOptions: { type: 'json', trimCodeBlocks: true },
	});

	if (!result.success) {
		console.warn("API: Failed to generate document outline:", result.error);
		return { documentOutline: [] };
	}

	// 如果成功解析了JSON，但需确保它是数组
	const outlineJson = result.data;
	if (!Array.isArray(outlineJson)) {
		console.warn("API: LLM did not return a valid JSON array for outline. Returning empty outline.");
		return { documentOutline: [] };
	}

	console.log("--- API: Successfully generated document outline ---");
	return { documentOutline: outlineJson };
}


// Node 4: Beautify HTML using LLM (原Node 3)
async function beautifyHtmlWithLlm(state) {
	console.log("--- API: BEAUTIFYING HTML WITH LLM (OpenRouter) ---");
	if (state.error) return { error: state.error };
	// 注意：此节点现在依赖 paragraphHtml，而不是 basicHtml
	if (!state.paragraphHtml) {
		// 如果 paragraphHtml 没有生成（例如 analyze_paragraphs 失败或跳过）
		// 并且 basicHtml 存在，可以考虑使用 basicHtml 作为备选
		if (state.basicHtml) {
			console.warn("API: No paragraph HTML, attempting beautification with basic HTML.");
			state.paragraphHtml = state.basicHtml; // 使用 basicHtml
		} else {
			return { error: "Cannot beautify: No HTML content available." };
		}
	}
	if (!state.userPrompt) {
		console.warn("API: No user prompt provided for styling. Skipping LLM beautification.");
		// 如果跳过美化，styledHtml 应等于 paragraphHtml
		return { styledHtml: state.paragraphHtml };
	}

	if (!LLM_CONFIG.apiKey) {
		console.error("API Error: No API Key is set.");
		// 如果没有key，无法美化，返回段落化的HTML
		return { styledHtml: state.paragraphHtml, error: "Server configuration error: Missing API Key for beautification. Returning unstyled HTML." };
	}

	// 使用导入的附加指令
	const additionalInstructions = beautifyHtmlLlmAdditionalInstructions;
	let userPromptWithInstructions = state.userPrompt + "\n" + additionalInstructions;
	// 使用 paragraphHtml 作为输入进行美化
	const systemPrompt = beautifySystemPromptGenerate(userPromptWithInstructions || '默认风格', state.paragraphHtml);

	const result = await invokeLlm({
		humanPrompt: systemPrompt,
		parseOptions: { type: 'html', trimCodeBlocks: true },
	});

	if (!result.success) {
		console.error("API Error calling LLM for beautification:", result.error);
		return {
			styledHtml: state.paragraphHtml,
			error: `LLM beautification failed. ${result.error}`
		};
	}

	const cleanedHtml = result.data;
	if (!cleanedHtml) {
		console.warn("API: LLM returned empty content after beautification. Using paragraph HTML.");
		return { styledHtml: state.paragraphHtml }; // Fallback
	}

	console.log("--- API: Successfully beautified HTML ---");
	return { styledHtml: cleanedHtml };
}

// Node 5: Finalize HTML Document (原Node 4)
async function finalizeHtmlDocument(state) {
	console.log("--- API: FINALIZING HTML DOCUMENT ---");
	// 错误优先传递
	if (state.error && typeof state.error === 'string' && state.error.startsWith('LLM beautification failed')) {
		// 如果是美化步骤失败，我们仍然有 paragraphHtml 和 outline，可以继续完成文档，只是样式可能不全
		console.warn(`Finalizing document with potential beautification error: ${state.error}`);
		// 清除美化错误，允许流程继续，但保留 styledHtml（可能是 fallback 的 paragraphHtml）
		state.error = null;
	} else if (state.error) {
		return { error: state.error }; // 其他错误则终止
	}

	let contentToFinalize = state.styledHtml;

	// 健壮性检查：如果 styledHtml 因故丢失，尝试用 paragraphHtml，最后用 basicHtml
	if (!contentToFinalize) {
		console.warn("API: No styled HTML found for finalization. Falling back.");
		contentToFinalize = state.paragraphHtml || state.basicHtml;
	}

	if (!contentToFinalize) {
		// 如果连 basicHtml 都没有，就真的没办法了
		return { error: "Cannot finalize: No HTML content available at any stage." };
	}


	// 基础样式保持不变
	const finalHtml = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated Document</title>
  <style>
    body {
      margin: 0;
      padding: 16px;
      font-family: sans-serif;
      line-height: 1.6;
      word-wrap: break-word;
      -webkit-text-size-adjust: 100%;
      color: #333;
    }
    img { max-width: 100%; height: auto; display: block; margin: 10px 0; }
    pre {
      overflow-x: auto;
      white-space: pre-wrap;
      word-wrap: break-word;
      background-color: #f8f9fa;
      padding: 10px;
      border: 1px solid #eee;
      border-radius: 4px;
    }
    code {
      font-family: monospace;
      background-color: #f8f9fa;
      padding: 2px 4px;
      border-radius: 2px;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      font-weight: 600;
      line-height: 1.25;
    }
    h1 { font-size: 2em; }
    h2 { font-size: 1.5em; }
    h3 { font-size: 1.25em; }
    p { margin: 0.5em 0; }
    ul, ol { margin: 0.5em 0; padding-left: 2em; }
    blockquote {
      margin: 1em 0;
      padding-left: 1em;
      border-left: 4px solid #eee;
      color: #555;
    }

    /* 组件默认视觉样式 (会被内联样式覆盖) */
    .date-component { color: #666; font-size: 0.9em; margin-bottom: 1.5em; }
    .ending-component { text-align: center; margin-top: 2em; font-weight: bold; }
    /* paragraph-component 的基础边距，可能会被内联样式覆盖 */
    .paragraph-component { margin: 1em 0; padding: 0; }

    /* 重要：主要样式应由 beautifyHtmlWithLlm 节点通过内联 style 属性添加 */
  </style>
</head>
<body>
${contentToFinalize}
</body>
</html>
`;
	console.log("--- API: Successfully finalized HTML document ---");
	// 返回最终 HTML，同时确保大纲数据也保留在状态中
	return { finalHtml: finalHtml, documentOutline: state.documentOutline };
}

// --- Define and Compile Graph ---
const workflow = new StateGraph({
	channels: {
		originalMarkdown: { value: (x, y) => y ?? x },
		userPrompt: { value: (x, y) => y ?? x },
		basicHtml: { value: (x, y) => y ?? x },
		paragraphHtml: { value: (x, y) => y ?? x },
		documentOutline: { value: (x, y) => y ?? x, default: () => [] }, // 新增: 大纲通道
		styledHtml: { value: (x, y) => y ?? x },
		finalHtml: { value: (x, y) => y ?? x },
		error: { value: (x, y) => y ?? x, default: () => null },
	},
});

// 添加所有节点
workflow.addNode("parse_markdown", parseMarkdown);
workflow.addNode("analyze_paragraphs", analyzeParagraphStructure);
workflow.addNode("generate_outline", generateDocumentOutline); // 新增大纲节点
workflow.addNode("beautify_html", beautifyHtmlWithLlm);
workflow.addNode("finalize_html", finalizeHtmlDocument);

// 定义工作流路径
workflow.setEntryPoint("parse_markdown");
workflow.addEdge("parse_markdown", "analyze_paragraphs");
workflow.addEdge("analyze_paragraphs", "generate_outline"); // analyze -> generate_outline
workflow.addEdge("generate_outline", "beautify_html");    // generate_outline -> beautify
workflow.addEdge("beautify_html", "finalize_html");
workflow.addEdge("finalize_html", END);

const app = workflow.compile();

// --- API Route Handler ---
export async function POST(request) {
	try {
		const body = await request.json();
		console.log("请求体:", body);
		const { markdown: originalMarkdown, prompt: userPrompt } = body;

		if (!originalMarkdown) {
			return NextResponse.json({ error: 'Markdown content is required.' }, { status: 400 });
		}

		if (!LLM_CONFIG.apiKey) {
			console.error("FATAL: No API Key is set in environment variables.");
			return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
		}

		console.log("API: Received request - Prompt:", userPrompt || "None");

		const inputs = {
			originalMarkdown: originalMarkdown,
			userPrompt: userPrompt || "",
		};

		console.log("--- API: Starting LangGraph invocation ---");
		const result = await app.invoke(inputs, { recursionLimit: 20 }); // 增加递归限制以适应更多节点
		console.log("--- API: LangGraph invocation finished ---");
		// console.log("Final State:", result); // Debugging: Log the entire final state

		// 检查最终结果中的错误
		if (result.error && !result.finalHtml) { // 如果有错误且没有最终HTML，则报告错误
			console.error("API: LangGraph finished with error:", result.error);
			return NextResponse.json({ error: `Processing failed: ${result.error}` }, { status: 500 });
		} else if (result.finalHtml && result.documentOutline !== undefined) {
			// 成功：同时返回 finalHtml 和 documentOutline
			console.log("API: Successfully generated final HTML and document outline.");
			// 如果在美化步骤有非阻塞性错误，可以在这里附加警告信息
			const responsePayload = {
				finalHtml: result.finalHtml,
				documentOutline: result.documentOutline
			};
			if (result.error) { // Include non-fatal errors as warnings
				console.warn("API: Processing completed with non-fatal error:", result.error);
				responsePayload.warning = `Processing completed with issues: ${result.error}`;
			}
			console.log(responsePayload)
			return NextResponse.json(responsePayload);
		} else {
			// 意外情况：没有错误但缺少必要输出
			console.error("API: LangGraph finished unexpectedly without error but missing finalHtml or documentOutline.", result);
			return NextResponse.json({ error: 'Processing completed, but failed to generate required outputs.' }, { status: 500 });
		}

	} catch (e) {
		console.error("API: Unhandled error in POST /api/beautify:", e);
		let errorMessage = 'An unexpected error occurred.';
		if (e instanceof SyntaxError) {
			errorMessage = 'Invalid request body.';
			return NextResponse.json({ error: errorMessage }, { status: 400 });
		} else if (e.message) {
			errorMessage = e.message;
		}
		// 记录更详细的错误堆栈
		if (e.stack) {
			console.error(e.stack);
		}
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}