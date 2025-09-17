import { splitToRows } from "../utils";

export const makeExpoundedKeys = (keys) => {
	const expoundedKeys = [];
	for (const compoundedKey of keys) {
		expoundedKeys.push(...splitToRows(compoundedKey));
	}

	return expoundedKeys;
};

onmessage = (e) => {
	const { keys, taskId } = e.data;
	console.log("worker: expounded-keys (" + taskId + ")");
	const expoundedKeys = makeExpoundedKeys(keys);
	postMessage({ taskId, expoundedKeys });
};
