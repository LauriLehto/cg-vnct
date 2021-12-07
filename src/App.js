import React, { useEffect, useState } from 'react'
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import DesktopDatePicker from '@mui/lab/DesktopDatePicker';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
//import {writeJsonFile} from 'write-json-file';


import CoinChart from './components/CoinChart'

function App() {

  const [ coinList, setCoinList ] = useState([])

  const [ selected, setSelected ] = useState({})
  const [ startDate, setStartDate ] = useState(new Date());
  const [ endDate, setEndDate ] = useState(new Date());
  const [ currency, setCurrency ] = useState({})

  const [ dataLoading, setDataLoading ] = useState(false)
  const [ listLoaded, setListLoaded ] = useState(false)
  const [ errors, setErrors ] = useState([])

  const today = new Date()

  useEffect(() => {
    try {
      fetch('/.netlify/functions/node-fetch', { headers: { accept: "Accept: application/json" } })
        .then(res => res.json())
        .then(json => {
          setCoinList(json.data)
          setListLoaded(true)
        })
    } catch (error) {
      console.error(error)
    }
  }, [setCoinList])

  const handleStart = (newValue) => {
    setStartDate(newValue);
  };

  const handleEnd = (newValue) => {
    setEndDate(newValue);
  };

  const handleList = (event, newValue) => {
    setSelected(newValue)
    const newErrors = [...errors]
    newErrors.splice(newErrors.indexOf('noCoin'),1)
    setErrors(newErrors)
  }

  const getNewData = () => {
    let newErrors = []
    if (Object.keys(selected).length && startDate<endDate ){
      console.log('set currency')
      setCurrency({selected, startDate, endDate})
      setDataLoading(true)     
      
    } else {
      // set error message
      if (startDate>endDate) newErrors = [...newErrors, 'rangeError']
      if (!Object.keys(selected).length && errors.indexOf('noCoin') < 0) newErrors = [...newErrors, 'noCoin']
    }
    setErrors(newErrors)
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Crypto Gecko Search
        </Typography>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Stack spacing={3}>
            <Autocomplete
              disableClearable
              disablePortal
              freeSolo
              id="combo-box-demo"
              options={coinList}
              getOptionLabel={(option) => option.name}
              onChange={handleList}
              renderInput={(params) =>
                <TextField
                  error={errors.indexOf('noCoin') >= 0}
                  helperText={errors.indexOf('noCoin') >= 0 && 'This field cannot be empty'}
                  {...params}
                  label="Select currency"
                >{ listLoaded && <CircularProgress />} </TextField>
              }
            />
            <DesktopDatePicker
              label="Start Date"
              maxDate={today}
              inputFormat="dd/MM/yyyy"
              value={startDate}
              onChange={handleStart}
              renderInput={(params) =>
                <TextField
                  error={errors.indexOf('rangeError') >= 0}
                  helperText={errors.indexOf('rangeError') >= 0 && 'Start date must be before the last date'}
                  {...params}
                />
              }
            />
            <DesktopDatePicker
              maxDate={today}
              label="End Date"
              inputFormat="dd/MM/yyyy"
              value={endDate}
              onChange={handleEnd}
              renderInput={(params) =>
                <TextField
                  error={errors.indexOf('rangeError') >= 0}
                  helperText={errors.indexOf('rangeError') >= 0 && 'Start date must be before the last date'}
                  {...params}
                />
              }
            />
            <Button
              onClick={getNewData}
              variant="contained">
              Get Info
              {dataLoading ? <CircularProgress size={20} color='inherit' /> : <></>}
            </Button>
          </Stack>
        </LocalizationProvider>
        <CoinChart 
          currency={currency}
          setDataLoading={setDataLoading}
          /> 
      </Box>
    </Container>
  );
}

export default App;



