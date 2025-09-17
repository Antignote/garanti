import  { useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
	changeTableMinGroup,
	changeTableMinU,
	toggleTableChanceFraction,
	toggleTableChancePercent,
	toggleTableGroupLast,
} from "./actions.js";
import {
	selectTableChanceFraction,
	selectTableChancePercent,
	selectTableGroupLast,
	selectTableMinGroup,
	selectTableMinU,
} from "./selectors.js";
import { WorkerContext } from "./workers/worker-manager.jsx";

export const TableControls = () => {
	const minGroup = useSelector(selectTableMinGroup);
	const minU = useSelector(selectTableMinU);
	const groupLast = useSelector(selectTableGroupLast);
	const chanceFraction = useSelector(selectTableChanceFraction);
	const chancePercent = useSelector(selectTableChancePercent);

	const dispatch = useDispatch();

	const handleChangeTableMinGroup = (event) => {
		dispatch(changeTableMinGroup(Number(event.target.value)));
	};

	const handleChangeTableMinU = (event) => {
		dispatch(changeTableMinU(Number(event.target.value)));
	};

	const handleChangeTableCollapseLast = () => {
		dispatch(toggleTableGroupLast());
	};

	const handleChangeTableChanceFraction = () => {
		dispatch(toggleTableChanceFraction());
	};

	const handleChangeTableChancePercent = () => {
		dispatch(toggleTableChancePercent());
	};

	const createTable = useContext(WorkerContext);
	useEffect(() => {
		createTable();
	}, [createTable]);

	return (
		<>
			<h2 className="text-xl font-normal mb-4 text-gray-900">
				Tabellinställningar
			</h2>
			<div>
				<div className="mb-4">
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Ner till vinstgrupp
					</label>
					<select
						className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
						value={minGroup}
						onChange={handleChangeTableMinGroup}
					>
						{[...Array(14).keys()].map((value) => (
							<option key={value} value={value}>
								{value}
							</option>
						))}
					</select>
				</div>
				<div className="mb-4">
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Minsta U-tecken
					</label>
					<select
						className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
						value={minU}
						onChange={handleChangeTableMinU}
					>
						{[...Array(14).keys()].map((value) => (
							<option key={value} value={value}>
								{value}
							</option>
						))}
					</select>
				</div>
				<div className="space-y-2">
					<label className="flex items-center">
						<input
							type="checkbox"
							checked={groupLast}
							onChange={handleChangeTableCollapseLast}
							className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
						/>
						<span className="ml-2 text-sm font-medium text-gray-700">
							Gruppera lägsta vinstgruppen
						</span>
					</label>
					<label className="flex items-center">
						<input
							type="checkbox"
							checked={chanceFraction}
							onChange={handleChangeTableChanceFraction}
							className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
						/>
						<span className="ml-2 text-sm font-medium text-gray-700">
							Chans som bråktal
						</span>
					</label>
					<label className="flex items-center">
						<input
							type="checkbox"
							checked={chancePercent}
							onChange={handleChangeTableChancePercent}
							className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
						/>
						<span className="ml-2 text-sm font-medium text-gray-700">
							Chans som procent
						</span>
					</label>
				</div>
			</div>
		</>
	);
};
