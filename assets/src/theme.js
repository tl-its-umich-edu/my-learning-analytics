import { createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
    palette: {
        /* The 'primary' color is used for structural components like the AppBar and SelectCard.
           Different institutions using this application are encouraged to modify the provided value. */
        primary: {
            main: "#40658F"
        },
        /* The 'secondary' color is used currently to indicate a positive, completed, viewed, or selected state.
           This value was arrived at through research and design work; modification is not recommended. */
        secondary: {
            main: "#4682b4"
        },
        /* The 'negative' color is used currently to indicate a negative, un-completed, un-viewed, or un-selected state.
           This value was arrived at through research and design work; modification is not recommended. */
        negative: {
            main: "#E1E1E1"
        }
    }
});

export default theme;