import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.jsx';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from '@material-ui/core/styles';
import { theme } from './theme.js';

ReactDOM.render(
	<React.StrictMode>
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<App />
		</ThemeProvider>
	</React.StrictMode>,
	document.getElementById('root'),
);

if (import.meta.hot) {
	import.meta.hot.accept();
}
