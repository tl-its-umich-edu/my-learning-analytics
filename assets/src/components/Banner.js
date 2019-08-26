import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'

const styles = theme => ({
    root: {
        flexGrow: 1,
        padding: 8,
    },
    paper: {
        padding: theme.spacing.unit,
        opacity: 0.9,
        boxShadow: "0px 2px 4px -1px rgba(0,0,0,0.2)"
        // width: 100 ???
        // color: theme.palette.text.secondary,
    }
})

function Banner (props) {
    const { classes, backgroundColor, textColor, children } = props;

    const paperStyle = {
        'background': backgroundColor,
    };

    return (
        <div className={classes.root}>
            <Grid container spacing={16}>
                <Grid item xs={12}>
                    <Paper className={classes.paper} style={paperStyle}>
                        <Typography variant="body1" align="center" style={{'color': textColor}} gutterBottom>
                            {children}
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </div>
    );
}

export default withStyles(styles)(Banner);