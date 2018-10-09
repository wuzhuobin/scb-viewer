import {Avatar, Button, CssBaseline, Paper, Typography, FormControl, InputLabel, 
	Input, FormControlLabel, Checkbox} from '@material-ui/core';
import React, { Component } from 'react';
import {withStyles} from '@material-ui/core/styles'
import PropTypes from 'prop-types';
import {Lock} from '@material-ui/icons'

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
		}
	}

	handleLogin = loginEvent =>{
		loginEvent.preventDefault()
		console.log("username: " + this.state.username)
		console.log("password: " + this.state.password)

		if (this.state.username === "user" && this.state.password === "sucabot"){
			console.log("correct");
			this.props.onAuth();
			// this.setState({foo: !this.state.foo});
		}
		else{
			console.log("wrong");
		}
	}

	handleChange = e =>{
		this.setState({[e.target.name]:e.target.value});
	}

	render(){
		const {username, password} = this.state
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
				</main>
			</React.Fragment>	
		)
			
	}
}

export default withStyles(styles)(Login)