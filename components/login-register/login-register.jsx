import React from 'react';
import './login-register.css';
//import fetchModel from '../../lib/fetchModelData';
import axios from 'axios';


/**
 * Define UserDetail, a React componment of CS142 project #5
 */
class LoginRegister extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loginName: '',
      password: '',
      loginMessage: '',
      registerMessage: '',
      registerForm: { registerName: '', newPassword: '', newPassword2: '', first_name: '', last_name: '', occupation: '', location: '', description: '' },
    };
    this.handleLoginChangeBound = event => this.handleLoginChange(event);
    this.handlePasswordChangeBound = event => this.handlePasswordChange(event);
    this.handleRegisterFormChangeBound = event => this.handleRegisterFormChange(event);
  }

  submitLogin = (event) => {
    event.preventDefault();
    const { loginName, password } = this.state;
    axios.post('/admin/login', { login_name: loginName, password: password })
      .then(response => {
        const user = response.data;
        this.props.onNewLogin(true);
        this.props.setUser(user);
        this.props.setRefreshUsers(true);
        const newUrl = "#/users/" + user._id;
        window.location.href = newUrl;
        const name = user.first_name + " " + user.last_name;
        axios.post('/addActivity', {date_time: Date.now, user_name: name, activity_type: "User logged in.", photo_id: null});
      })
      .catch(error => {
        console.error(error);
        this.setState({ loginMessage: error.response.data});
      });
  };

  submitRegister = (event) => {
    event.preventDefault();
    const { registerForm } = this.state;
    if (registerForm.newPassword !== registerForm.newPassword2) {
      this.setState({ registerMessage: "The passwords do not match" });
      return;
    } 
    if (!registerForm.registerName) {
      this.setState({ registerMessage: "You must enter a login name" });
      return;
    }
    if (!registerForm.newPassword) {
      this.setState({ registerMessage: "You must enter a password" });
      return;
    }
    if (!registerForm.first_name) {
      this.setState({ registerMessage: "You must enter a first name" });
      return;
    }
    if (!registerForm.last_name) {
      this.setState({ registerMessage: "You must enter a last name" });
      return;
    }
    axios.post('/user', {
      login_name: registerForm.registerName, 
      password: registerForm.newPassword, 
      first_name: registerForm.first_name, 
      last_name: registerForm.last_name,
      occupation: registerForm.occupation, 
      location: registerForm.location, 
      description: registerForm.description
    })
      .then(() => {
        this.setState({registerMessage: "You are now registered. You may now log in."});
        this.setState({registerForm: { registerName: '', newPassword: '', newPassword2: '', first_name: '', last_name: '', occupation: '', location: '', description: '' }});
        const name = registerForm.first_name + " " + registerForm.last_name;
        axios.post('/addActivity', {date_time: Date.now, user_name: name, activity_type: "User registered.", photo_id: null});
      })
      .catch(error => {
        console.error(error);
        this.setState({ registerMessage: error.response.data });
      });
  };

  handleLoginChange = (event) => {
    this.setState({ loginName: event.target.value });
  };

  handlePasswordChange = (event) => {
    this.setState({ password: event.target.value });
  };

  handleRegisterFormChange = (event) => {
    const { name, value } = event.target;
    this.setState(prevState => ({
      registerForm: {
        ...prevState.registerForm,
        [name]: value
      }
    }));
  };

  render() {
    const { loginName, loginMessage, password, registerForm, registerMessage } = this.state;
    return (
      <div className="cs142-login-container">
        <form className="cs142-login-form" onSubmit={this.submitLogin}>
          <div className="cs142-login-form-name">Login existing user</div>
          <label>
            Login Name:
            <input type="text" value={loginName} onChange={this.handleLoginChangeBound} />
          </label>
          <br></br>
          <label>
            Password:
            <input type="password" value={password} onChange={this.handlePasswordChangeBound} />
          </label>
          <br></br>
          <button className="cs142-login-submit" type="submit">Submit</button>
          <div className="cs142-login-error">{loginMessage}</div>
        </form>
       
        <form className="cs142-login-form" onSubmit={this.submitRegister}>
          <div className="cs142-login-form-name">Register new user</div>
          <label>
            New Login Name:
            <input type="text" name="registerName" value={registerForm.registerName} onChange={this.handleRegisterFormChangeBound} />
          </label>
          <br></br>
          <label>
            New Password:
            <input type="password" name="newPassword" value={registerForm.newPassword} onChange={this.handleRegisterFormChangeBound} />
          </label>
          <br></br>
          <label>
            Re-type Password:
            <input type="password" name="newPassword2" value={registerForm.newPassword2} onChange={this.handleRegisterFormChangeBound} />
          </label>
          <br></br>
          <label>
            First Name:
            <input type="text" name="first_name" value={registerForm.first_name} onChange={this.handleRegisterFormChangeBound} />
          </label>
          <br />
          <label>
            Last Name:
            <input type="text" name="last_name" value={registerForm.last_name} onChange={this.handleRegisterFormChangeBound} />
          </label>
          <br />
          <label>
            Occupation:
            <input type="text" name="occupation" value={registerForm.occupation} onChange={this.handleRegisterFormChangeBound} />
          </label>
          <br />
          <label>
            Location:
            <input type="text" name="location" value={registerForm.location} onChange={this.handleRegisterFormChangeBound} />
          </label>
          <br />
          <label>
            Description:
            <input type="text" name="description" value={registerForm.description} onChange={this.handleRegisterFormChangeBound} />
          </label>
          <br />
          <button className="cs142-login-submit" type="submit">Register Me</button>
          <div className="cs142-login-error">{registerMessage}</div>
        </form>
      </div>
    );
  }
}

export default LoginRegister;
