import { NextResponse } from 'next/server';

export async function POST(request) {
	console.log("测试 /api/test/finalize_html...");
	try {
		const { htmlInput } = await request.json();

		if (typeof htmlInput !== 'string') {
			return NextResponse.json(
				{ error: "请求体中缺少有效的 'htmlInput' 字符串" },
				{ status: 400 }
			);
		}

		// 逻辑直接从 beautify/route.js 的 finalizeHtmlDocument 节点复制和适配
		const finalHtml = `<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<style>
		/* 基础样式 */
		.result-body {
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
			line-height: 1.6;
			color: #333;
			max-width: 900px;
			margin: 0 auto;
			padding: 20px;
		}
		
		/* 暗黑模式支持 */
		@media (prefers-color-scheme: dark) {
			.result-body {
				background-color: #121212;
				color: #e0e0e0;
			}
			a {
				color: #90caf9;
			}
		}
	</style>
</head>
<body class="result-body">
${htmlInput} 
</body>
</html>`;

		return NextResponse.json({ finalHtml: finalHtml.trim(), error: null });

	} catch (error) {
		console.error("测试 finalize_html 出错:", error);
		return NextResponse.json(
			{ finalHtml: `<html><body><h1>Error</h1><p>${error.message}</p></body></html>`, error: `最终化HTML出错: ${error.message}` },
			{ status: 500 }
		);
	}
} 