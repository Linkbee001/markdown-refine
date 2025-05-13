import { NextResponse } from 'next/server';
import jsdom from 'jsdom';
// Note: Adjust these import paths based on your actual project structure
import { generateDocumentOutlineSystemPrompt } from '../../../prompts/generateDocumentOutlinePrompt.js';
import {
	LLM_CONFIG,
	invokeLlm,
	hasValidApiKey
} from '../../../services/llmService.js';
import {
	createBasicOutlineFromHtml
	// cleanHtmlContent // Removed as it does not exist in htmlService.js
} from '../../../services/htmlService.js'; // Keep this if needed

const { JSDOM } = jsdom;

// Helper to ensure IDs are sorted by their appearance order in the document
const sortIdsByDomOrder = (dom, ids) => {
	const elements = Array.from(dom.window.document.body.querySelectorAll('[id]'));
	const idOrderMap = new Map();
	elements.forEach((el, index) => {
		if (ids.includes(el.id)) {
			idOrderMap.set(el.id, index);
		}
	});
	// Filter out any IDs not found in the map and sort
	return ids
		.filter(id => idOrderMap.has(id))
		.sort((a, b) => idOrderMap.get(a) - idOrderMap.get(b));
};


export async function POST(request) {
	console.log("\n--- Merge Components API Start ---");
	try {
		const { html, componentIds } = await request.json();

		if (!html || !componentIds || !Array.isArray(componentIds) || componentIds.length < 2) {
			console.error('Merge API: Invalid input - Missing html or insufficient componentIds.');
			return NextResponse.json({ error: 'Invalid input: html and at least two componentIds are required.' }, { status: 400 });
		}

		console.log(`Merge API: Received request to merge ${componentIds.length} components:`, componentIds);
		console.log(`Merge API: Initial HTML length: ${html.length}`);

		const dom = new JSDOM(html);
		const document = dom.window.document;

		// Ensure IDs are processed in their document order
		const sortedIds = sortIdsByDomOrder(dom, componentIds);
		console.log('Merge API: Sorted component IDs:', sortedIds);

		if (sortedIds.length !== componentIds.length) {
			console.warn('Merge API: Some provided IDs were not found or duplicates existed. Processing found IDs:', sortedIds);
			if (sortedIds.length < 2) {
				return NextResponse.json({ error: 'Not enough valid and distinct component IDs found in the HTML to perform a merge.' }, { status: 400 });
			}
		}

		const firstItemId = sortedIds[0];
		const firstElement = document.getElementById(firstItemId);

		if (!firstElement) {
			console.error(`Merge API: First element ID not found after sorting: ${firstItemId}`);
			return NextResponse.json({ error: `Component ID ${firstItemId} not found.` }, { status: 400 });
		}

		// --- Merge Content ---
		let addedContentHtml = '';
		for (let i = 1; i < sortedIds.length; i++) {
			const currentId = sortedIds[i];
			const currentElement = document.getElementById(currentId);

			if (!currentElement) {
				console.warn(`Merge API: Element ID ${currentId} not found during merging, skipping.`);
				continue;
			}

			// Append content with a space separator
			addedContentHtml += ' ' + currentElement.innerHTML;
			console.log(`Merge API: Collecting content from ${currentElement.tagName}#${currentElement.id}`);

			// --- Remove Merged Element ---
			if (currentElement.parentNode) {
				currentElement.parentNode.removeChild(currentElement);
				console.log(`Merge API: Removed element ${currentElement.tagName}#${currentElement.id}`);
			} else {
				console.warn(`Merge API: Element ${currentId} has no parentNode, cannot remove.`);
			}
		}

		// Append the collected HTML to the first element
		firstElement.innerHTML += addedContentHtml;
		console.log(`Merge API: Finished merging content into ${firstElement.id}`);

		// --- Get Modified HTML ---
		const mergedHtmlBody = document.body.innerHTML;
		// const mergedHtml = cleanHtmlContent ? cleanHtmlContent(mergedHtmlBody) : mergedHtmlBody; // cleanHtmlContent does not exist
		const mergedHtml = mergedHtmlBody; // Directly use mergedHtmlBody
		console.log(`Merge API: Merged HTML length: ${mergedHtml.length}`);


		// --- Re-generate Document Outline ---
		console.log("Merge API: Re-generating document outline...");
		let newDocumentOutline = [];
		let outlineWarning = null;

		if (hasValidApiKey(/* pass apiKey if needed by hasValidApiKey */)) {
			try {
				const result = await invokeLlm({
					systemPrompt: typeof generateDocumentOutlineSystemPrompt === 'function'
						? generateDocumentOutlineSystemPrompt()
						: generateDocumentOutlineSystemPrompt,
					humanPrompt: mergedHtml,
					modelOptions: {
						modelName: LLM_CONFIG.outlineModel || LLM_CONFIG.defaultModel,
						temperature: LLM_CONFIG.outlineTemperature
					},
					parseOptions: { type: 'json', trimCodeBlocks: true }
				});

				if (result.success && Array.isArray(result.data) && result.data.length > 0) {
					newDocumentOutline = result.data;
					console.log(`Merge API: LLM Outline re-generated successfully. Items: ${newDocumentOutline.length}`);
				} else {
					console.warn("Merge API: LLM outline generation failed or returned empty/invalid data. Falling back to basic outline.");
					if (result.error) console.error("LLM Error:", result.error);
					outlineWarning = "LLM outline generation failed, using basic outline.";
					const basicOutlineResult = createBasicOutlineFromHtml(mergedHtml);
					newDocumentOutline = basicOutlineResult.outline;
				}
			} catch (llmError) {
				console.error("Merge API: Error during LLM outline re-generation:", llmError);
				outlineWarning = `Error during LLM outline generation: ${llmError.message}. Using basic outline.`;
				const basicOutlineResult = createBasicOutlineFromHtml(mergedHtml);
				newDocumentOutline = basicOutlineResult.outline;
			}
		} else {
			console.warn("Merge API: Missing or invalid API key. Generating basic outline.");
			outlineWarning = "API key missing or invalid, using basic outline.";
			const basicOutlineResult = createBasicOutlineFromHtml(mergedHtml);
			newDocumentOutline = basicOutlineResult.outline;
		}

		console.log("--- Merge Components API End ---");
		const responsePayload = {
			finalHtml: mergedHtml,
			documentOutline: newDocumentOutline,
		};
		if (outlineWarning) {
			responsePayload.warning = outlineWarning;
		}
		return NextResponse.json(responsePayload);

	} catch (error) {
		console.error("Merge API: Unhandled error in POST handler:", error);
		const errorMessage = error instanceof Error ? error.message : String(error);
		return NextResponse.json({ error: `Internal server error: ${errorMessage}` }, { status: 500 });
	}
}

// Basic health check or info endpoint
export async function GET() {
	return NextResponse.json({ message: 'Merge Components API is active. Use POST to merge.' });
} 