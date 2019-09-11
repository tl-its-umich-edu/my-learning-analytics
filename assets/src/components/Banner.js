import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'

const styles = theme => ({
    root: {
        flexGrow: 1,
        padding: 8
    },
    paper: {
        align: "center",
        padding: theme.spacing.unit * 2,
        opacity: 0.9,
        boxShadow:
            "0px 2px 4px -1px rgba(0,0,0,0.2), " +
            "0px 4px 5px 0px rgba(0,0,0,0.14), " +
            "0px 1px 10px 0px rgba(0,0,0,0.12)"
    }
});

function Banner (props) {
    const { classes, settings, children } = props;

    const paperStyle = {
        background: settings.backgroundColor,
        borderColor: settings.borderColor
    };

    const typographyStyle = {
        color: settings.textColor,
        fontSize: "1.0rem",
        textAlign: "center"
    };

    return (
        <div className={classes.root}>
            <Grid container spacing={16}>
                <Grid item xs={12}>
                    <Paper className={classes.paper} style={paperStyle}>
                        <Typography style={typographyStyle} gutterBottom>
                            {children}
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </div>
    );
}

export default withStyles(styles)(Banner);