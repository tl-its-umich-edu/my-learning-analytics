import TextField from '@material-ui/core/TextField'
import { withStyles } from '@material-ui/core/styles'

const orange = '#ffae42'

const StyledTextField = withStyles({
  root: {
    '& .MuiFormLabel-root.Mui-error': {
      color: orange
    },
    '& .MuiInput-underline.Mui-error:after': {
      borderBottomColor: orange
    },
    '& .MuiInputBase-input': {
      color: 'green'
    },
    '& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline': {
      borderColor: orange
    }
  }
})(TextField)

export default StyledTextField
