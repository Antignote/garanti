import {
	Box,
	Button,
	Checkbox,
	FormControlLabel,
	makeStyles,
	TextField,
} from '@material-ui/core';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	selectDisabledSubmit,
	selectFull,
	selectHalf,
	selectKeys,
	selectSystem,
	selectSystems,
	selectU,
} from './selectors.js';
import {
	setFull,
	setHalf,
	changeSystem,
	clearSystem,
	enterKeys,
	addTask,
	toggleU,
} from './actions.js';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import { taskType } from './task-type.js';

const hedges = [...Array(14).keys()];

const useStyles = makeStyles((theme) => ({
	spaceBelow: {
		marginBottom: theme.spacing(2),
	},
	resetBtn: {
		float: 'right',
	},
	copyKeysBtn: {
		float: 'right',
	},
}));

export const SystemForm = () => {
	const classes = useStyles();

	const dispatch = useDispatch();

	const full = useSelector(selectFull);
	const half = useSelector(selectHalf);
	const u = useSelector(selectU);
	const keys = useSelector(selectKeys);
	const system = useSelector(selectSystem);

	const handleChangeU = () => {
		dispatch(toggleU());
	};

	const handleChangeFull = (event) => {
		dispatch(setFull(Number(event.target.value)));
	};

	const handleChangeHalf = (event) => {
		dispatch(setHalf(Number(event.target.value)));
	};

	const handleChangeKeys = (event) => {
		dispatch(enterKeys(event.target.value));
	};

	const handleCalculate = (e) => {
		e.preventDefault();
		dispatch(
			addTask({
				task: taskType.TASK_TYPE_EXPOUNDED_KEYS,
				id: performance.now(),
			}),
		);
	};

	const handleResetForm = () => {
		dispatch(clearSystem());
	};

	const systems = useSelector(selectSystems);

	const handleChangeRUSystem = (event) => {
		const name = event.target.value;
		dispatch(
			changeSystem({
				name,
				system: systems[name],
			}),
		);
	};

	const handleCopyKeys = async () => {
		navigator.permissions.query({ name: 'clipboard-write' }).then((result) => {
			if (result.state == 'granted' || result.state == 'prompt') {
				navigator.clipboard.writeText(keys).then(
					() => {},
					() => {
						alert('Kopieringen misslyckades');
					},
				);
			}
		});
	};

	const disableSubmit = keys.trim().length === 0;
	const disableReset = useSelector(selectDisabledSubmit);

	return (
		<form onSubmit={handleCalculate} onReset={handleResetForm}>
			<TextField
				className={classes.spaceBelow}
				label="Helgarderingar"
				select
				fullWidth
				SelectProps={{
					native: true,
				}}
				value={full}
				onChange={handleChangeFull}
			>
				{hedges.map((value) => (
					<option key={value} value={value}>
						{value === 0
							? 'Inga'
							: value + ' helgardering' + (value > 1 ? 'ar' : '')}
					</option>
				))}
			</TextField>
			<TextField
				className={classes.spaceBelow}
				select
				label="Halvgarderingar"
				fullWidth
				SelectProps={{
					native: true,
				}}
				value={half}
				onChange={handleChangeHalf}
			>
				{hedges.map((value) => (
					<option key={value} value={value}>
						{value === 0
							? 'Inga'
							: value + ' halvgardering' + (value > 1 ? 'ar' : '')}
					</option>
				))}
			</TextField>
			<Box display="flex" className={classes.spaceBelow}>
				<FormControlLabel
					control={
						<Checkbox
							checked={u}
							onChange={handleChangeU}
							name="checkedB"
							color="primary"
						/>
					}
					label="U-system"
				/>
				{keys && (
					<Box alignSelf="flex-end" flexGrow="1">
						<Button
							variant="contained"
							color="default"
							size="small"
							className={classes.copyKeysBtn}
							onClick={handleCopyKeys}
							startIcon={<FileCopyIcon />}
						>
							Kopiera
						</Button>
					</Box>
				)}
			</Box>
			<TextField
				className={classes.spaceBelow}
				multiline
				label="Nyckelrader"
				rows={5}
				rowsMax={12}
				fullWidth
				onChange={handleChangeKeys}
				value={keys}
			/>
			<TextField
				className={classes.spaceBelow}
				select
				label="Fördefinerade R- och U-system"
				SelectProps={{
					native: true,
				}}
				fullWidth
				value={system}
				onChange={handleChangeRUSystem}
			>
				<option value={0}>Ej valt</option>
				{Object.keys(systems).map((value) => (
					<option key={value} value={value}>
						{value}
					</option>
				))}
			</TextField>
			<Box>
				<Button
					disabled={disableSubmit}
					variant="contained"
					color="primary"
					size="large"
					type="submit"
				>
					Beräkna garanti
				</Button>
				<Button
					variant="contained"
					color="default"
					type="reset"
					size="small"
					disabled={disableReset}
					className={classes.resetBtn}
				>
					Rensa
				</Button>
			</Box>
		</form>
	);
};
