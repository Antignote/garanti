import { createContext, useCallback, useEffect, useRef, useState } from "react";
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

export const WorkerContext = createContext<(() => void) | null>(null);

import type { MutableRefObject, Dispatch, SetStateAction, ReactNode } from "react";

const useTriggerExpoundedKeysWorker = (): void => {
       const currentTask = useSelector(selectCurrentTask);
       const keys = useSelector(selectKeys);
       useEffect(() => {
	       if (currentTask === "expoundedKeys") {
		       const trimmedKeys: number[][] = keys
			       .trim()
			       .split("\n")
			       .map((line: string) => line.trim())
			       .filter((line: string) => line.length > 0)
			       .map((line: string) => line.split("").map((x: string) => Number(x)));
		       expoundedKeysWorker.postMessage({
			       taskId: performance.now(),
			       keys: trimmedKeys,
		       });
	       }
       }, [currentTask, keys]);
};

const useTriggerGarantiWorker = (expoundedKeysRef: MutableRefObject<any>): void => {
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

const useTriggerTableWorker = (garantiRows: any, expoundedKeysRef: MutableRefObject<any>): void => {
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

const useExpoundedKeysResult = (expoundedKeysRef: MutableRefObject<any>): void => {
       const dispatch = useDispatch();
       useEffect(() => {
	       const onMessage = (event: MessageEvent) => {
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

const useGarantiRowsResult = (setGarantiRows: Dispatch<SetStateAction<any>>): void => {
       const dispatch = useDispatch();
       useEffect(() => {
	       const onMessage = (event: MessageEvent) => {
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

const useTableResult = (): void => {
       const dispatch = useDispatch();
       useEffect(() => {
	       const onMessage = (event: MessageEvent) => {
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

interface WorkerManagerProps {
       children: ReactNode;
}

export const WorkerManager = ({ children }: WorkerManagerProps) => {
       // const lastTaskId = useSelector(selectLastTaskId);

       const expoundedKeys = useRef<any>(null);
       const [garantiRows, setGarantiRows] = useState<any>();

       useTriggerExpoundedKeysWorker();
       useTriggerGarantiWorker(expoundedKeys);
       useTriggerTableWorker(garantiRows, expoundedKeys);

       useExpoundedKeysResult(expoundedKeys);
       useGarantiRowsResult(setGarantiRows);
       useTableResult();

       const dispatch = useDispatch();

       const createTable = useCallback(() => {
	       if (garantiRows) {
		       dispatch(
			       addTask({
				       task: "table",
				       id: performance.now(),
			       }),
		       );
	       }
       }, [garantiRows, dispatch]);

       return (
	       <WorkerContext.Provider value={createTable}>
		       {children}
	       </WorkerContext.Provider>
       );
};
