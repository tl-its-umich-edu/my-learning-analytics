import { createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
    palette: {
        /* The core color. 'main' is used for structural components like the AppBar and SelectCard;
        *  'light' is used in visualizations as a primary color to indicate a positive/completed/viewed state. */
        primary: {
            main: "#40658F",
            light: "#7092BF"
        },
        /* A minor color. 'main' is used currently to indicate a negative/un-completed/un-viewed state. If another
        * core color is needed, this could be bumped to a separate object in the palette. */
        secondary: {
            main: "#9E9E9E"
        }
    }
});

export default theme;