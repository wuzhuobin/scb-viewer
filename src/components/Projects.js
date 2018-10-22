import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import ProjectTable from './ProjectTable'

function TabContainer(props) {
  return (
    <Typography component="div" style={{ padding: 8 * 3 }}>
      {props.children}
    </Typography>
  );
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

const styles = theme => ({
  root: {
    //flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
  button: {
    margin: theme.spacing.unit,
    marginLeft: 'auto',
  },
  input: {
    display: 'none',
  },

});

class Projects extends React.Component {
  state = {
    value: 'one',
  };

  handleChange = (event, value) => {
    this.setState({ value });
  };

  render() {
    const { classes } = this.props;
    const { value } = this.state;

    return (
      <div className={classes.root}>
        <AppBar position="static">
          <Tabs value={value} onChange={this.handleChange}>
            <Tab value="one" label="Project" />
            <Tab value="two" label="Item Two" />
            <Tab value="three" label="Item Three" />
            <Button variant="contained" color="secondary" className={classes.button}>
              New Project
            </Button>  
          </Tabs>
        
        </AppBar>
        {value === 'one' && <TabContainer><ProjectTable/></TabContainer>}
        {value === 'two' && <TabContainer>Item Two</TabContainer>}
        {value === 'three' && <TabContainer>Item Three</TabContainer>}
      </div>
    );
  }
}

Projects.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Projects);