const Loading = () => {
	return (
		<div class="flex space-x-2 justify-center items-center mt-72 bg-white  dark:text-white dark:bg-slate-800">
			<div class="h-8 w-8 bg-black rounded-full animate-bounce [animation-delay:-0.3s]"></div>
			<div class="h-8 w-8 bg-black rounded-full animate-bounce [animation-delay:-0.15s]"></div>
			<div class="h-8 w-8 bg-black rounded-full animate-bounce"></div>
		</div>
	);
};

export default Loading;
