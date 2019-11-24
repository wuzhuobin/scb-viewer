import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import classNames from 'classnames';
import {withStyles} from '@material-ui/core/styles'

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    overflowX: 'auto',
  },
  table: {
    minWidth: 1000,
  },
})

class DicomHeaderDialog extends React.Component {
  state = {
    scroll: 'paper',
    rowCount: 0,
  };

  handleClickOpen = scroll => () => {
   this.setState({ open: true, scroll });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  createData(name, calories, fat, carbs, protein) 
  {
    this.state.rowCount += 1;
    var i = this.state.rowCount;
    return { i, name, calories, fat, carbs, protein };
  }


  render() {
      const {classes, theme,open, onClose} = this.props
      const rows = [
      this.createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
      this.createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
      this.createData('Eclair', 262, 16.0, 24, 6.0),
      this.createData('Cupcake', 305, 3.7, 67, 4.3),
      this.createData('Gingerbread', 356, 16.0, 49, 3.9),
      ];
    return (
      <div>
        <Dialog
          open={open}
          onClose={onClose}
          scroll={this.state.scroll}
          aria-labelledby="HeaderInfo"
        >
          <DialogTitle id="HeaderInfo">Header Information</DialogTitle>
          <DialogContent>
           <Table className={classes.table}>
              <TableHead>
                <TableRow>
                  <TableCell>Dessert (100g serving)</TableCell>
                  <TableCell numeric>Calories</TableCell>
                  <TableCell numeric>Fat (g)</TableCell>
                  <TableCell numeric>Carbs (g)</TableCell>
                  <TableCell numeric>Protein (g)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map(row => {
                  return (
                    <TableRow key={row.id}>
                      <TableCell component="th" scope="row">
                        {row.name}
                      </TableCell>
                      <TableCell numeric>{row.calories}</TableCell>
                      <TableCell numeric>{row.fat}</TableCell>
                      <TableCell numeric>{row.carbs}</TableCell>
                      <TableCell numeric>{row.protein}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

export default withStyles(styles)(DicomHeaderDialog);