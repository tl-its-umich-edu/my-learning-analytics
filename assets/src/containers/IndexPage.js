import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import SelectCard from '../components/SelectCard';
import { Link } from 'react-router-dom'
import routes from '../routes/routes'

const styles = theme => ({
    root: {
        flexGrow: 1,
      },
    wrapper: {
        marginTop: theme.spacing.unit * 2,
        flexDirection: "row",
        justifyContent: "center"
    },
})

function IndexPage (props) {
    const { classes, match } = props;
    const currentCourseId = match.params.courseId
    return (
        <Grid container spacing={16} className={classes.root}>
            <Grid item xs={12}>
                <Grid 
                container 
                className={classes.wrapper} 
                spacing={8}
                >
                {
                    routes(currentCourseId).map((props, key) => 
                    <Link style={{ textDecoration: 'none' }} to={props.path} key={key}>
                        <SelectCard cardData = {props} />
                    </Link>
                )}
                </Grid>
            </Grid>
        </Grid>
    )
}

export default withStyles(styles)(IndexPage);