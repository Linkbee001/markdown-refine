"use client"; // Mark this component as a Client Component

import React, { useState } from 'react';

const NODES = [
	{ value: 'parse_markdown', label: '1. Parse Markdown', inputs: ['markdown'], outputKey: 'htmlResult', outputType: 'html' },
	{ value: 'analyze_paragraphs', label: '2. Analyze Paragraphs', inputs: ['htmlInput'], outputKey: 'analyzedHtml', outputType: 'html' },
	{ value: 'generate_outline', label: '3. Generate Outline', inputs: ['htmlInput'], outputKey: 'documentOutline', outputType: 'json' },
	{ value: 'refine_user_prompt', label: '4. Refine User Prompt', inputs: ['userPrompt'], outputKey: 'refinedUserPrompt', outputType: 'text' },
	{ value: 'beautify_html', label: '5. Beautify HTML', inputs: ['htmlInput', 'prompt'], outputKey: 'styledHtml', outputType: 'html' },
	{ value: 'finalize_html', label: '6. Finalize HTML', inputs: ['htmlInput'], outputKey: 'finalHtml', outputType: 'html' },
];

export default function TestNodesPage() {
	const [selectedNode, setSelectedNode] = useState(NODES[0].value);
	const [inputs, setInputs] = useState({
		markdown: '# Hello\n\nThis is a test.',
		htmlInput: '<h1>Hello</h1><p>This is a test.</p>',
		userPrompt: 'Make it look like a professional technical blog post.',
		prompt: 'Make it look like a professional technical blog post.',
	});
	const [output, setOutput] = useState(null);
	const [error, setError] = useState(null);
	const [warning, setWarning] = useState(null);
	const [isLoading, setIsLoading] = useState(false);

	const handleNodeChange = (event) => {
		setSelectedNode(event.target.value);
		setOutput(null); // Clear previous output
		setError(null);
		setWarning(null);
	};

	const handleInputChange = (event) => {
		const { name, value } = event.target;
		setInputs(prev => ({ ...prev, [name]: value }));
	};

	const getApiEndpoint = (nodeValue) => {
		return `/api/test/${nodeValue}`;
	};

	const runTest = async () => {
		const nodeConfig = NODES.find(n => n.value === selectedNode);
		if (!nodeConfig) return;

		setIsLoading(true);
		setOutput(null);
		setError(null);
		setWarning(null);

		const endpoint = getApiEndpoint(selectedNode);
		const body = {};
		nodeConfig.inputs.forEach(inputKey => {
			if (inputKey !== 'apiKey') {
				body[inputKey] = inputs[inputKey] || '';
			}
		});

		console.log(`Calling ${endpoint} with body:`, body);

		try {
			const response = await fetch(endpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(body),
			});

			const data = await response.json();
			console.log("API Response:", data);

			if (!response.ok) {
				if (response.status === 401) {
					setError(`API Error (401 Unauthorized): ${data.error || 'Missing or invalid API Key on server side?'}`);
				} else {
					setError(`API Error (${response.status}): ${data.error || 'Unknown error'}`);
				}

				if (data[nodeConfig.outputKey]) {
					setOutput(data[nodeConfig.outputKey]);
				} else if (data.analyzedHtml) {
					setOutput(data.analyzedHtml);
				} else if (data.styledHtml) {
					setOutput(data.styledHtml);
				} else if (data.refinedUserPrompt) {
					setOutput(data.refinedUserPrompt);
				}
			} else {
				setOutput(data[nodeConfig.outputKey]);
				if (data.warning) {
					setWarning(data.warning);
				}
			}
		} catch (err) {
			console.error("Fetch Error:", err);
			setError(`Fetch Error: ${err.message}`);
		} finally {
			setIsLoading(false);
		}
	};

	const renderInputFields = () => {
		const nodeConfig = NODES.find(n => n.value === selectedNode);
		if (!nodeConfig) return null;

		return nodeConfig.inputs.map(inputKey => {
			if (inputKey === 'apiKey') return null;

			const isTextArea = ['markdown', 'htmlInput', 'userPrompt', 'prompt'].includes(inputKey);
			const label = inputKey.charAt(0).toUpperCase() + inputKey.slice(1).replace(/([A-Z])/g, ' $1');

			return (
				<div key={inputKey} style={{ marginBottom: '15px' }}>
					<label htmlFor={inputKey} style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
						{label}:
					</label>
					{isTextArea ? (
						<textarea
							id={inputKey}
							name={inputKey}
							value={inputs[inputKey] || ''}
							onChange={handleInputChange}
							rows={8}
							style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontFamily: 'monospace' }}
							placeholder={`Enter ${label} here...`}
						/>
					) : (
						<input
							id={inputKey}
							name={inputKey}
							type={'text'}
							value={inputs[inputKey] || ''}
							onChange={handleInputChange}
							style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
							placeholder={`Enter ${label} here...`}
						/>
					)}
				</div>
			);
		});
	};

	const renderOutput = () => {
		if (!output && !error && !warning && !isLoading) return null;

		const nodeConfig = NODES.find(n => n.value === selectedNode);
		// const outputType = nodeConfig?.outputType || 'text'; // No longer needed for rendering decision

		return (
			<div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
				<h3 style={{ marginBottom: '10px' }}>Output:</h3>
				{isLoading && <p>Loading...</p>}
				{error && <pre style={{ color: 'red', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>Error: {error}</pre>}
				{warning && <pre style={{ color: 'orange', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>Warning: {warning}</pre>}
				{/* Always render output inside a pre tag */}
				{output !== null && output !== undefined && (
					<pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', whiteSpace: 'pre-wrap', wordWrap: 'break-word', maxHeight: '500px', overflowY: 'auto' }}>
						{typeof output === 'object' ? JSON.stringify(output, null, 2) : String(output)}
					</pre>
				)}
			</div>
		);
	};


	return (
		<div style={{ padding: '20px', maxWidth: '800px', margin: 'auto', fontFamily: 'sans-serif' }}>
			<h1 style={{ textAlign: 'center', marginBottom: '30px' }}>LangGraph Node Tester</h1>

			<div style={{ marginBottom: '20px' }}>
				<label htmlFor="node-select" style={{ marginRight: '10px', fontWeight: 'bold' }}>Select Node to Test:</label>
				<select id="node-select" value={selectedNode} onChange={handleNodeChange} style={{ padding: '8px', borderRadius: '4px' }}>
					{NODES.map(node => (
						<option key={node.value} value={node.value}>
							{node.label}
						</option>
					))}
				</select>
			</div>

			<div style={{ marginBottom: '20px', padding: '20px', border: '1px solid #eee', borderRadius: '5px', background: '#fafafa' }}>
				<h3 style={{ marginTop: '0', marginBottom: '15px' }}>Inputs:</h3>
				{renderInputFields()}
			</div>


			<button
				onClick={runTest}
				disabled={isLoading}
				style={{
					padding: '10px 20px',
					fontSize: '16px',
					cursor: isLoading ? 'not-allowed' : 'pointer',
					backgroundColor: isLoading ? '#ccc' : '#007bff',
					color: 'white',
					border: 'none',
					borderRadius: '4px',
					opacity: isLoading ? 0.7 : 1,
				}}
			>
				{isLoading ? 'Running...' : 'Run Test'}
			</button>

			{renderOutput()}
		</div>
	);
} 