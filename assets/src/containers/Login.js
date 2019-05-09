import React, { useState } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import { Typography } from '@material-ui/core'
import Cookie from 'js-cookie'

const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: 8
  },
  paper: {
    padding: theme.spacing.unit * 2,
    color: theme.palette.text.secondary
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: '100%'
  },
  button: {
    margin: theme.spacing.unit,
    width: '100%'
  }
})

function Login (props) {
  const { classes } = props
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const csrfToken = Cookie.get('csrftoken')

  const handleSubmit = () => {
    const formData = new FormData()

    formData.append('csrfmiddlewaretoken', csrfToken)
    formData.append('username', username)
    formData.append('password', password)

    const fetchOptions = {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      credentials: 'include',
      body: formData
    }

    fetch('http://localhost:5001/accounts/login', fetchOptions)
      .then(x => console.log(x))
  }

  return (
    <div className={classes.root}>
      <Grid container justify='center'>
        <Grid item xs={7} md={5} lg={4}>
          <Paper className={classes.paper}>
            <Typography variant='h6' gutterBottom>Sign in to My Learning Analytics</Typography>
            <form style={{ overflow: 'hidden' }}>
              <TextField
                label='Username'
                className={classes.textField}
                value={username}
                onChange={event => setUsername(event.target.value)}
                margin='normal' />
              <TextField
                label='Password'
                className={classes.textField}
                value={password}
                onChange={event => setPassword(event.target.value)}
                margin='normal' />
              <Button variant='contained' color='primary' className={classes.button} onClick={handleSubmit}>
                Sign in
              </Button>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </div>
  )
}

export default withStyles(styles)(Login)
