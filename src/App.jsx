import React, { useState, useEffect } from 'react';
import {
  TextField,
  Container,
  FormControlLabel,
  Checkbox,
  Grid,
  MenuItem,
  Box,
  Typography,
  Button,
  LinearProgress,
  Icon,
  TextareaAutosize,
  Snackbar,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import garanti from './worker.js';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import { systems } from './systems.js';
import { ZERO_TO_ONE_INDEX } from './utils.js';
import MuiAlert from '@material-ui/lab/Alert';

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const hedges = [...Array(14).keys()];

const useStyles = makeStyles((theme) => ({
  spaceBelow: {
    marginBottom: theme.spacing(2),
  },
  moreSpaceBelow: {
    marginBottom: theme.spacing(4),
  },
}));

const App = () => {
  const classes = useStyles();
  const [full, setFull] = useState(0);
  const [half, setHalf] = useState(0);
  const [u, setU] = useState(true);
  const [keys, setKeys] = useState('');
  const [table, setTable] = useState('');
  const [loading, setLoading] = useState(false);
  const [ruSystem, setRUSystem] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onMessage = (event) => {
      if (event.data instanceof ErrorEvent) {
        alert(event.message);
      } else {
        setTable(event.data);
      }
      setLoading(false);
    };

    garanti.addEventListener('message', onMessage);
    return () => {
      garanti.removeEventListener('message', onMessage);
    };
  }, []);

  const handleChangeU = () => {
    setU((u) => !u);
    setRUSystem(0);
  };

  const handleChangeFull = (event) => {
    setFull(event.target.value);
    setRUSystem(0);
  };

  const handleChangeHalf = (event) => {
    setHalf(event.target.value);
    setRUSystem(0);
  };

  const handleChangeKeys = (event) => {
    setKeys(event.target.value);
    setRUSystem(0);
  };

  const handleCalculate = () => {
    setLoading(true);
    garanti.postMessage([full, half, u, keys]);
  };

  const handleChangeRUSystem = (event) => {
    setRUSystem(event.target.value);
    if (event.target.value) {
      const { numFullHedges, numHalfHedges, rows } = systems[
        event.target.value
      ];
      setHalf(numHalfHedges);
      setFull(numFullHedges);
      setKeys(
        rows
          .map((row) => {
            return row
              .map((sign) => {
                return ZERO_TO_ONE_INDEX[sign];
              })
              .join('');
          })
          .join('\n'),
      );
      setU(event.target.value.toLowerCase()[0] === 'u');
    }
  };

  const handleCopy = () => {
    navigator.permissions.query({ name: 'clipboard-write' }).then((result) => {
      if (result.state == 'granted' || result.state == 'prompt') {
        navigator.clipboard.writeText(table).then(
          () => {
            setCopied(true);
          },
          () => {
            alert('Kopieringen misslyckades');
          },
        );
      }
    });
  };

  const handleCloseCopySnackbar = () => {
    setCopied(false);
  };

  const disableSubmit = keys.trim().length === 0;

  return (
    <>
      <Snackbar
        open={copied}
        autoHideDuration={1000}
        onClose={handleCloseCopySnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseCopySnackbar} severity="success">
          Kopierat och klart!
        </Alert>
      </Snackbar>
      <Grid container>
        <Grid item xs={12} md={5} lg={4} xl={3}>
          <Box px={2} pt={3}>
            <Typography variant="h4" component="h1" gutterBottom>
              Garantiräknaren
            </Typography>
            <Typography
              className={classes.moreSpaceBelow}
              variant="body1"
              gutterBottom
            >
              Ett verktyg för att beräkna och skapa garantitabeller för dina
              system. Mata bara in antal hel- och halvgarderingar samt dina
              nyckelrader och tryck sen på "Beräkna garanti" så börjar
              programmet räkna ut garantin.
            </Typography>
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
            <FormControlLabel
              className={classes.spaceBelow}
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
              label="R- och U-system från Svenska Spel"
              SelectProps={{
                native: true,
              }}
              fullWidth
              value={ruSystem}
              onChange={handleChangeRUSystem}
            >
              <option value={0}>Ej valt</option>
              {Object.keys(systems).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </TextField>
            <Button
              disabled={disableSubmit}
              variant="contained"
              color="primary"
              onClick={handleCalculate}
              size="large"
            >
              Beräkna garanti
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} md={7} lg={8} xl={9}>
          <Box px={2} pt={3}>
            {loading ? (
              <LinearProgress />
            ) : (
              table && (
                <>
                  <Button
                    variant="contained"
                    color="default"
                    className={classes.button}
                    onClick={handleCopy}
                    disabled={copied}
                    startIcon={<FileCopyIcon />}
                  >
                    Kopiera
                  </Button>
                  <Box fontSize={16}>
                    <pre>{table}</pre>
                  </Box>
                </>
              )
            )}
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default App;
