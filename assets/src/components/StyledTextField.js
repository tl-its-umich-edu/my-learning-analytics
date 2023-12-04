import TextField from '@mui/material/TextField'
import withStyles from '@mui/styles/withStyles'

const StyledTextField = withStyles(theme => ({
  root: {
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
  }
}))(TextField)

export default StyledTextField
