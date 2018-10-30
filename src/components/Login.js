import {Avatar, Button, CssBaseline, Paper, Typography, FormControl, InputLabel, 
	Input, FormControlLabel, Checkbox, Snackbar} from '@material-ui/core';
import React, { Component } from 'react';
import {withStyles} from '@material-ui/core/styles'
import PropTypes from 'prop-types';
import {Lock} from '@material-ui/icons';
import axios from 'axios';

const styles = theme=> ({
  layout: {
    width: 'auto',
    display: 'block', // Fix IE11 issue.
    marginLeft: theme.spacing.unit * 3,
    marginRight: theme.spacing.unit * 3,
    [theme.breakpoints.up(400 + theme.spacing.unit * 3 * 2)]: {
      width: 400,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },
  form: {
    width: '100%', // Fix IE11 issue.
    marginTop: theme.spacing.unit,
  },
  paper: {
    marginTop: theme.spacing.unit * 8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme.spacing.unit * 3}px`,
  },
  button: {
    margin: theme.spacing.unit,
  },
  avatar: {
    margin: theme.spacing.unit,
    backgroundColor: theme.palette.secondary.main,
  },
  submit: {
    marginTop: theme.spacing.unit * 3,
  },
})

class Login extends Component {
	constructor(props){
		super(props);
		this.state={
			username: '',
			password: '',
			showWrong: false,
			showLoginMsg: false,
		}
	}

	handleLogin = loginEvent =>{
		loginEvent.preventDefault()
		console.log("username: " + this.state.username)
		console.log("password: " + this.state.password)
		const formData = new FormData();
		const userName = this.state.username;
		const passWord = this.state.password;
	  	formData.append('headers', {'Access-Control-Allow-Origin': '*'});
	  	formData.append('body',{'username': this.state.username});
	  	//formData.append({'password': 'sucabot'});
	  	this.setState({showLoginMsg: true});
	  	axios({
  				method: 'post',
  				url: 'http://35.220.153.243/api/account',
  				data: {
    			username: this.state.username,
    			password: this.state.password
			  	},
			  	headers:  {'Access-Control-Allow-Origin': '*'},
			})
	      .then(res => {
	         console.log(res);
	        if (res.data.Status == 'Success' )
	        {
	        	console.log("correct");
	        	this.props.onAuth();
	        }
	        else
	        {
	        	console.log("wrong");	
	        	this.setState({showLoginMsg: false});
	        	this.setState({showWrong: true});
	        }
	      }).catch((error)=>{
	      	console.log(error)
	      })
	}

	handleChange = e =>{
		this.setState({[e.target.name]:e.target.value});
	}

	handleCloseWrongMsg = () => {
    	this.setState({ showWrong: false });
  	};

  	handleCloseLoginMsg = () => {
    	this.setState({ showLoginMsg: false });
  	};

	render(){
		const {username, password, showWrong, showLoginMsg} = this.state
		const {classes} = this.props

		return(
			<React.Fragment>
				<CssBaseline />
				<main className={classes.layout}>
					<Paper className={classes.paper}>
						<Avatar className={classes.avatar}>
							<Lock />
						</Avatar>
						<Typography component="h1" variant="display1">
			            	Sign in
			          	</Typography>
			          	<form className={classes.form} onSubmit={this.handleLogin}>
			          		<FormControl margin="normal" required fullWidth>
			          			<InputLabel htmlFor="username">Username</InputLabel>
              					<Input 
              						id="username" 
              						name="username" 
              						autoComplete="username" 
              						value={this.state.username} 
              						onChange={this.handleChange}
              						autoFocus 
              					/>
			          		</FormControl>
			          		<FormControl margin="normal" required fullWidth>
			          			<InputLabel htmlFor="password">Password</InputLabel>
			          			<Input
					                name="password"
					                type="password"
					                id="password"
					                autoComplete="current-password"
					          		value={this.state.password}
					          		onChange={this.handleChange}
					             />
				            </FormControl>
				            <FormControlLabel
				              control={<Checkbox value="remember" color="primary" />}
				              label="Remember me"
				            />
				            <Button
				              type="submit"
				              fullWidth
				              variant="contained"
				              color="primary"
				              className={classes.submit}
				            >
				              Sign in
				            </Button>
			          	</form>
					</Paper>

					<Snackbar
						anchorOrigin={{vertical:'bottom',horizontal:'right'}}
						open={showWrong}
						onClose={this.handleCloseWrongMsg}
						message={<span id="message-id">Invalid Username/Password</span>}
					/>	
					<Snackbar
						anchorOrigin={{vertical:'bottom',horizontal:'right'}}
						open={showLoginMsg}
						onClose={this.handleCloseLoginMsg}
						message={<span id="message-id">Logging In...</span>}
					/>	
				</main>
			</React.Fragment>	
		)
			
	}
}

export default withStyles(styles)(Login)