import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import axios from 'axios';


const CustomTableCell = withStyles(theme => ({
  head: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    overflowX: 'auto',
  },
  table: {
    minWidth: 700,
  },
  row: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.background.default,
    },
  },
});

// let id = 0;
// function createData(name, calories, fat, carbs, protein) {
//   id += 1;
//   return { id, name, calories, fat, carbs, protein };
// }

// function getProjectData(){
//   axios({
//       method: 'get',
//       url: 'http://192.168.1.112:8080/api/project/user3',
//       headers:  {'Access-Control-Allow-Origin': '*'},
//   })
//     .then(res => {
//         console.log(res.data);
//         return(res.data);
//     }).catch((error)=>{
//       console.log(error)
//     })
// }

//const rows = [
//  createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
//  createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
//  createData('Eclair', 262, 16.0, 24, 6.0),
//  createData('Cupcake', 305, 3.7, 67, 4.3),
//createData('Gingerbread', 356, 16.0, 49, 3.9),
//];

class ProjectTable extends React.Component {
  
  componentDidMount(){
    axios({
      method: 'get',
      url: 'http://192.168.1.112:8080/api/project/user3',
      headers:  {'Access-Control-Allow-Origin': '*'},
    })
    .then(res => {
        console.log(res.data);
        this.setState({rows: res.data});
    }).catch((error)=>{
      console.log(error)
    })
  }
  
  render(){
    const { classes } = this.props;
    const { rows } = this.state
    return (
      <Paper className={classes.root}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <CustomTableCell>Project ID</CustomTableCell>
              <CustomTableCell numeric>Project Name</CustomTableCell>
              <CustomTableCell numeric>Permission</CustomTableCell>
              <CustomTableCell numeric>Last Update</CustomTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.state.rows.map(row => {
              return (
                <TableRow className={classes.row} key={row._id}>
                  <CustomTableCell component="th" scope="row">
                    {row.project._id}
                  </CustomTableCell>
                  <CustomTableCell numeric>{row.project.name}</CustomTableCell>
                  <CustomTableCell numeric>{row.permission}</CustomTableCell>
                  <CustomTableCell numeric>{row.project.updatedAt}</CustomTableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>
    );
  }
}

ProjectTable.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ProjectTable);