import * as React from 'react';
import 'dayjs/locale/ja';
import dayjs, { Dayjs } from 'dayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

export const TimePickerValue = (props: any) => {

  const [value, setValue] = React.useState<Dayjs | null>(dayjs('2022-04-17T 12:00'));

  React.useEffect(() => {
    
    if (props.time) {      
      setValue(dayjs(`2022-04-17T ${props.time}`))
    } else {
      setValue(null)
    }
  }, [props])

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='ja'>
      <TimePicker
        value={value}
        disabled = {props.disabled}
        format='HH:mm'
        onChange={props.onChange}
        // ampm={true}
        sx={{
          "& .MuiOutlinedInput-root": {
            height: 40,
            fontSize: 'inherit',
          },
          "input": {
            '-webkit-text-fill-color': '#000 !important',
          },
          "fieldset": {
            border: 'none',
          },
        }}
      />
    </LocalizationProvider>
  );
}