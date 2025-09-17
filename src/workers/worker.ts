export const expoundedKeysWorker = new Worker(
	new URL("./expounded-keys-worker.js", import.meta.url),
	{
		type: "module",
	},
);

export const garantiWorker = new Worker(
	new URL("./garanti-worker.js", import.meta.url),
	{
		type: "module",
	},
);

export const tableWorker = new Worker(
	new URL("./table-worker.js", import.meta.url),
	{
		type: "module",
	},
);
