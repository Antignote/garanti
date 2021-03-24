import { Box, Button, LinearProgress, Typography } from '@material-ui/core';
import React from 'react';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import { useSelector } from 'react-redux';
import {
	selectCurrentTask,
	selectGarantiTable,
	selectIsWorking,
} from './selectors';
import { taskType } from './task-type';

const loadingTexts = {
	[taskType.TASK_TYPE_EXPOUNDED_KEYS]: 'Vecklar ut nyckelrader',
	[taskType.TASK_TYPE_GARANTI_ROWS]: 'Beräknar garanti',
	[taskType.TASK_TYPE_TABLE]: 'Bygger tabell',
};

export const Table = () => {
	const table = useSelector(selectGarantiTable);

	const handleCopy = () => {
		navigator.permissions.query({ name: 'clipboard-write' }).then((result) => {
			if (result.state == 'granted' || result.state == 'prompt') {
				navigator.clipboard.writeText(table).then(
					() => {},
					() => {
						alert('Kopieringen misslyckades');
					},
				);
			}
		});
	};

	const isLoading = useSelector(selectIsWorking);
	const task = useSelector(selectCurrentTask);

	return isLoading ? (
		<>
			<Typography variant="subtitle1" gutterBottom>
				{loadingTexts[task]}
			</Typography>
			<LinearProgress />
		</>
	) : table ? (
		<>
			<Button
				variant="contained"
				color="default"
				// className={classes.button}
				onClick={handleCopy}
				startIcon={<FileCopyIcon />}
			>
				Kopiera
			</Button>
			<Box fontSize={16} style={{ overflowX: 'auto' }}>
				<pre>{table}</pre>
			</Box>
		</>
	) : null;
};
