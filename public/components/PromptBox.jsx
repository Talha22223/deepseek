import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { assets } from '@/assets/assets';

const PromptBox = ({
	onSendMessage = () => { console.error("onSendMessage not provided"); },
	isLoading,
	selectedModel = 'gpt-3.5-turbo'
}) => {
	const [prompt, setPrompt] = useState('');
	const [rows, setRows] = useState(1);
	const textareaRef = useRef(null);

	// Auto-resize textarea
	useEffect(() => {
		if (textareaRef.current) {
			textareaRef.current.style.height = 'auto';
			const newHeight = Math.min(textareaRef.current.scrollHeight, 200);
			textareaRef.current.style.height = `${newHeight}px`;
			setRows(Math.ceil(newHeight / 24));
		}
	}, [prompt]);

	const handleChange = (e) => {
		setPrompt(e.target.value);
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (prompt.trim() && !isLoading) {
			onSendMessage(prompt);
			setPrompt('');
		}
	};

	return (
		<form onSubmit={handleSubmit} className="w-full max-w-3xl bg-[#404045] p-4 rounded-3xl mt-4 transition-all">
			<textarea
				ref={textareaRef}
				className="w-full bg-transparent outline-none resize-none overflow-hidden break-words text-white/90"
				rows={rows}
				placeholder="Message DeepSeek"
				required
				onChange={handleChange}
				value={prompt}
				disabled={isLoading}
			/>
			<div className="flex items-center justify-between text-sm mt-2">
				<div className="flex items-center gap-2">
					<p className="flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transition">
						<Image className="h-5" src={assets.deepthink_icon} alt="" />
						{selectedModel === 'gpt-4' ? 'GPT-4' : 'GPT-3.5'}
					</p>
					<p className="flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transition">
						<Image className="h-5" src={assets.search_icon} alt="" />
						Search
					</p>
				</div>
				<div className="flex items-center gap-2">
					{isLoading ? (
						<div className="w-8 h-8 rounded-full bg-[#71717a] flex items-center justify-center">
							<div className="w-4 h-4 border-2 border-white/80 border-t-transparent rounded-full animate-spin"></div>
						</div>
					) : (
						<>
							<Image className="w-4 cursor-pointer" src={assets.pin_icon} alt="" />
							<button
								type="submit"
								className={`w-8 h-8 rounded-full flex items-center justify-center ${
									prompt ? "bg-primary" : "bg-[#71717a]"
								}`}
								disabled={!prompt || isLoading}
							>
								<Image
									className="w-3.5 aspect-square"
									src={prompt ? assets.arrow_icon : assets.arrow_icon_dull}
									alt=""
								/>
							</button>
						</>
					)}
				</div>
			</div>
		</form>
	);
};

export default PromptBox;
