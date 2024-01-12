import TextField from '@mui/material/TextField'
import { styled } from '@mui/material/styles'

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiFormLabel-root.Mui-error': {
    color: theme.palette.warning.dark
  },
  '& .MuiInput-underline.Mui-error:after': {
    borderBottomColor: theme.palette.warning.main
  },
  '& .MuiInputBase-input': {
    color: 'green'
  },
  '& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.warning.main
  }
}))

export default StyledTextField
