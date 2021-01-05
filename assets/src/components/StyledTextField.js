import TextField from '@material-ui/core/TextField'
import { withStyles } from '@material-ui/core/styles'

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
