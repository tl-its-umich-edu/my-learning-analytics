const defaultPalette = {
  /* The 'primary' color is used for structural components like the AppBar and SelectCard.
     Different institutions using this application are encouraged to modify the provided value. */
  primary: {
    main: '#00274C'
  },
  /* The 'secondary' color is used currently to indicate a positive, completed, viewed, or selected state.
     This value was arrived at through research and design work; use caution when modifying. */
  secondary: {
    main: '#2C6496'
  },
  /* The 'negative' color is used currently to indicate a negative, un-completed, un-viewed, or un-selected
     state. This value was arrived at through research and design work; use caution when modifying. For now,
     this should be used directly through theme.palette.negative.main instead of the color prop
     (i.e. color='negative'), which isn't fully supported. */
  negative: {
    main: '#B5B5B5'
  },
  /* The 'link' color is used to identify text and icons in views that link to external resources. For now,
     this should be used directly through theme.palette.link.main instead of the color prop
     (i.e. color='link'), which isn't fully supported. */
  link: {
    main: '#0000EE'
  },
  /*  The 'info' color is used to confirm a submitted or stored by system state. */
  info: {
    main: '#FFB74D'
  },
  /*  The 'warning' color is used with text or interface elements to alert the user something may be wrong or
      needs their attention. */
  warning: {
    main: '#D84315'
  }
}

export default defaultPalette
