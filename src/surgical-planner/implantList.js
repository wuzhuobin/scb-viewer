import React from "react";
import classNames from 'classnames';
import {Button, Grid, Snackbar, Popover, List, ListItem, ListItemText, 
  ListItemIcon, Typography, Divider, ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary}  from '@material-ui/core';
import Slider from '@material-ui/lab/Slider';
import {LibraryAdd} from '@material-ui/icons';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {withStyles} from '@material-ui/core/styles'

const styles = theme=> ({
    root:{    
        width: '300px',
        height: 'calc(100vh - 64px - 64px)',
    },
    slider: {
      padding: '22px 10px',
      width: 200,
    },
    button:{
      color: theme.palette.primary.main,
      '&:hover': {
          backgroundColor: theme.palette.secondary.light,
        }
    },
    label: {
    // Aligns the content of the button vertically.
      flexDirection: 'column',
      textTransform: 'none',
      // fontSize: '3px',
      color: theme.palette.primary.contrastText,
      '&:hover': {
          color: theme.palette.secondary.contrastText,
          },
    },
})

class ImplantList extends React.Component {
  constructor(props)
  {
    super(props);
    this.state = {
      value1: 50,
      value2: 50,
      value3: 50,
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0
    };
  }

  render() {
    const {classes} = this.props
    const {value1, value2, value3, rotateX, rotateY, rotateZ} = this.state

    return(
      <div className={classes.root}>

      <List>
        <ListItem button className={classes.button}>
          <ListItemIcon className={classes.button} onClick={() => {return;}}>
            <LibraryAdd />
                </ListItemIcon>
                <ListItemText primary={<Typography variant="body1" style={{ color: 'white' }}>Insert New Implant </Typography>} />
              </ListItem>
            </List>


            <Button classes={{label: classes.label}} color="inherit" size="small" 
                onClick={() => {}}
              >
                Set Position
              </Button>

              <Slider
                classes={{ container: classes.slider }}
                value={value1}
                aria-labelledby="label"
                onChange={(event,value1)=>{
                  var val = (value1-50)/50*180;
                  this.setState({ value1}); 
                  this.setState({ rotateX:val }); 
                }}
              />
              <Slider
                classes={{ container: classes.slider }}
                value={value2}
                aria-labelledby="label"
                onChange={(event,value2)=>{
                  var val = (value2-50)/50*180;
                  this.setState({ value2 }); 
                  this.setState({ rotateY:val }); 
                }}
              />
              <Slider
                classes={{ container: classes.slider }}
                value={value3}
                aria-labelledby="label"
                onChange={(event,value3)=>{
                  var val = (value3-50)/50*180;
                  this.setState({ value3 }); 
                  this.setState({ rotateZ:val }); 
                }}
              />
    </div>
  )
  }

}

export default withStyles(styles)(ImplantList);