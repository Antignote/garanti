import { splitToRows } from "../utils";
import type { ExpoundedKeysWorkerMessage, ExpoundedKeysWorkerResponse } from "../types";

export const makeExpoundedKeys = (keys: number[][]): number[][] => {
	const expoundedKeys: number[][] = [];
	for (const compoundedKey of keys) {
		 expoundedKeys.push(...splitToRows(compoundedKey));
	}
	return expoundedKeys;
};

self.onmessage = (e: MessageEvent) => {
	const { keys, taskId } = e.data as ExpoundedKeysWorkerMessage;
	console.log(`worker: expounded-keys (${taskId})`);
	const expoundedKeys = makeExpoundedKeys(keys);
	postMessage({ taskId, expoundedKeys } as ExpoundedKeysWorkerResponse);
};
