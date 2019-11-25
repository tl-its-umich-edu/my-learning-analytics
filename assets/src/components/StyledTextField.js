import TextField from '@material-ui/core/TextField'
import { withStyles } from '@material-ui/core/styles'

const StyledTextField = withStyles({
  root: {
    '& .MuiFormLabel-root.Mui-error': {
      color: '#ffae42'
    },
    '& .MuiInput-underline.Mui-error:after': {
      borderBottomColor: '#ffae42'
    },
    '& .MuiInputBase-input': {
      marginTop: '10px',
      color: 'green'
    }
  }
})(TextField)

export default StyledTextField
