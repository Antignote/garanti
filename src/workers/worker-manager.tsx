import { createContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addTask, taskDone } from "../actions";
import {
	selectCurrentTask,
	selectFull,
	selectHalf,
	selectKeys,
	selectTableChanceFraction,
	selectTableChancePercent,
	selectTableGroupLast,
	selectTableMinGroup,
	selectTableMinU,
	selectU,
} from "../selectors";
import { expoundedKeysWorker, garantiWorker, tableWorker } from "./worker";

export const WorkerContext = createContext(null as any);

const useTriggerExpoundedKeysWorker = () => {
	const currentTask = useSelector(selectCurrentTask);
	const keys = useSelector(selectKeys);
	useEffect(() => {
		if (currentTask === "expoundedKeys") {
			const trimmedKeys = keys
				.trim()
				.split("\n")
				.map((line) => line.trim())
				.filter((line) => {
					return line.length > 0;
				})
				.map((line) => line.split("").map((x) => Number(x)));
			expoundedKeysWorker.postMessage({
				taskId: performance.now(),
				keys: trimmedKeys,
			});
		}
	}, [currentTask, keys]);
};

const useTriggerGarantiWorker = (expoundedKeysRef) => {
	const currentTask = useSelector(selectCurrentTask);
	const fullHedges = useSelector(selectFull);
	const halfHedges = useSelector(selectHalf);
	const uSystem = useSelector(selectU);
	const keys = useSelector(selectKeys);

	useEffect(() => {
		if (currentTask === "garantiRows") {
			garantiWorker.postMessage({
				taskId: performance.now(),
				fullHedges,
				halfHedges,
				expoundedKeys: expoundedKeysRef.current,
				uSystem,
			});
		}
	}, [currentTask, fullHedges, halfHedges, keys, uSystem]);
};

const useTriggerTableWorker = (garantiRows, expoundedKeysRef) => {
	const currentTask = useSelector(selectCurrentTask);
	const tableMinGroup = useSelector(selectTableMinGroup);
	const tableMinU = useSelector(selectTableMinU);
	const collapseLast = useSelector(selectTableGroupLast);
	const fullHedges = useSelector(selectFull);
	const halfHedges = useSelector(selectHalf);
	const uSystem = useSelector(selectU);
	const chanceFraction = useSelector(selectTableChanceFraction);
	const chancePercent = useSelector(selectTableChancePercent);

	useEffect(() => {
		if (currentTask === "table") {
			tableWorker.postMessage({
				taskId: performance.now(),
				tableMinGroup,
				tableMinU,
				collapseLast,
				rows: garantiRows,
				uSystem,
				fullHedges,
				halfHedges,
				systemSize: expoundedKeysRef.current.length,
				chanceFraction,
				chancePercent,
			});
		}
	}, [currentTask]);
};

const useExpoundedKeysResult = (expoundedKeysRef) => {
	const dispatch = useDispatch();
	useEffect(() => {
		const onMessage = (event) => {
			if (event.data) {
				const { taskId, expoundedKeys } = event.data;
				expoundedKeysRef.current = expoundedKeys;
				dispatch(
					taskDone({
						id: taskId,
						task: "expoundedKeys",
					}),
				);
			}
		};

		expoundedKeysWorker.addEventListener("message", onMessage);

		return () => {
			expoundedKeysWorker.removeEventListener("message", onMessage);
		};
	}, []);
};

const useGarantiRowsResult = (setGarantiRows) => {
	const dispatch = useDispatch();
	useEffect(() => {
		const onMessage = (event) => {
			if (event.data) {
				const { taskId, garantiRows } = event.data;
				setGarantiRows(garantiRows);
				dispatch(
					taskDone({
						id: taskId,
						task: "garantiRows",
					}),
				);
			}
		};

		garantiWorker.addEventListener("message", onMessage);
		return () => {
			garantiWorker.removeEventListener("message", onMessage);
		};
	}, []);
};

const useTableResult = () => {
	const dispatch = useDispatch();
	useEffect(() => {
		const onMessage = (event) => {
			if (event.data) {
				const { taskId, table } = event.data;
				dispatch(
					taskDone({
						id: taskId,
						task: "table",
						data: { table },
					}),
				);
			}
		};

		tableWorker.addEventListener("message", onMessage);
		return () => {
			tableWorker.removeEventListener("message", onMessage);
		};
	}, []);
};

export const WorkerManager = ({ children }) => {
	// const lastTaskId = useSelector(selectLastTaskId);

	const expoundedKeys = useRef();
	const [garantiRows, setGarantiRows] = useState();

	useTriggerExpoundedKeysWorker();
	useTriggerGarantiWorker(expoundedKeys);
	useTriggerTableWorker(garantiRows, expoundedKeys);

	useExpoundedKeysResult(expoundedKeys);
	useGarantiRowsResult(setGarantiRows);
	useTableResult();

	const dispatch = useDispatch();

	const createTable = () => {
		if (garantiRows) {
			dispatch(
				addTask({
					task: "table",
					id: performance.now(),
				}),
			);
		}
	};

	return (
		<WorkerContext.Provider value={createTable}>
			{children}
		</WorkerContext.Provider>
	);
};
