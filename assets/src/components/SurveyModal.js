import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import Modal from '@material-ui/core/Modal';
import CloseIcon from '@material-ui/icons/Close';

function getModalStyle() {
  const top = 10;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  dialogTitle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0px'
  },
  iframeContainer: {
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    paddingTop: '150%'
  },
  /* Then style the iframe to fit in the container div with full height and width */
  iframe: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: '100%',
    height: '100%'
  }
}));

export default function SurveyModal(props) {
  const classes = useStyles();
  // getModalStyle is not a pure function, we roll the style only on the first render
  const [modalStyle] = React.useState(getModalStyle);
  const [open, setOpen] = React.useState(false);

  const toggleOpen = () => setOpen(!open)

  const body = (
    <div style={modalStyle} className={classes.paper}>
      <DialogTitle disableTypography className={classes.dialogTitle}>
        <h4 id="survey-modal-title">Take the My Learning Analytics Survey</h4>
        <IconButton onClick={toggleOpen}>
            <CloseIcon />
        </IconButton>
      </DialogTitle>

      <p id="survey-modal-description">
        <div className={classes.iframeContainer}>
          <iframe className={classes.iframe} src={props.surveyURL} height="600px" width="400px"></iframe>
        </div>
      </p>
    </div>
  );

  return (
    <div>
      <Button variant="contained" color="secondary" onClick={toggleOpen}>Take Survey</Button>
      <Modal
        open={open}
        onClose={toggleOpen}
        aria-labelledby="survey-modal-title"
        aria-describedby="survey-modal-description"
      >
        {body}
      </Modal>
    </div>
  );
}
