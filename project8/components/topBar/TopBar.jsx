import React from 'react';
import {
  AppBar, Toolbar, Typography, Button
} from '@mui/material';
import './TopBar.css';
//import fetchModel from '../../lib/fetchModelData';
import axios from 'axios';

/**
 * Define TopBar, a React componment of CS142 project #5
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      info: null
    };
  }

  componentDidMount() {
    const url = "http://localhost:3000/test/info";
    axios.get(url)
      .then(response => {
        const info = response.data;
        this.setState({ info });
      })
      .catch(error => {
        console.error(error);
      });
  }

  logout = () => {
    const name = this.props.state.loggedInUser.first_name + " " + this.props.state.loggedInUser.last_name;
    axios.post('/addActivity', { date_time: Date.now, user_name: name, activity_type: "User logged out.", photo_id: null })
      .then(() => {
        axios.post('/admin/logout', {})
          .then(() => {
            this.props.onNewLogin(false);
          })
          .catch(error => {
            console.error(error);
          });
      });
  };

  handleUploadButtonClicked = (e) => {
    e.preventDefault();
    if (this.uploadInput.files.length > 0) {
      // Create a DOM form and add the file to it under the name uploadedphoto
      const domForm = new FormData();
      domForm.append('uploadedphoto', this.uploadInput.files[0]);
      axios.post('/photos/new', domForm)
        // should return photo_id
        .then((response1) => {
          const photo = response1.data;
          const newU = "http://localhost:3000/user/" + this.props.state.loggedInUser._id;
          axios.get(newU)
            .then((response) => {
              this.props.onNewInfo(response.data);
              const name = response.data.first_name + " " + response.data.last_name;
              console.log(photo);
              console.log(photo.file_name);
              axios.post('/addActivity', { date_time: Date.now, user_name: name, activity_type: "Photo upload.", file_name: photo.file_name });
              const newUrl = "#/photos/" + this.props.state.loggedInUser._id;
              window.location.href = newUrl;
              this.props.incrementCount();
            })
            .catch(error => {
              console.error(error);
            });
        })
        .catch(err => console.log(`POST ERR: ${err}`));
    }
  };

  render() {
    let version;
    if (this.state.info) {
      version = this.state.info.__v;
    }
    let appContext = this.props.context;
    const user = this.props.state.currentUser;
    if (appContext === "photos") {
      appContext = "Photos of: " + user.first_name + " " + user.last_name;
    } else if (appContext === "user") {
      appContext = "Details of: " + user.first_name + " " + user.last_name;
    }
    let advanced = this.props.state.advancedFeatures;
    const isLoggedIn = this.props.state.isLoggedIn;
    let mainMessage;
    if (!isLoggedIn) {
      mainMessage = "Please Log In";
    } else {
      mainMessage = "Hi " + this.props.state.loggedInUser.first_name;
    }
    return (
      <AppBar className="cs142-topbar-appBar" position="absolute">
        <Toolbar className="cs142-topbar-toolBar">
          <Typography className="cs142-topbar-name" variant="h5" color="inherit">
            {mainMessage}
          </Typography>
          {isLoggedIn && (
            <Button variant="contained" component="label">
              Log Out
              <button hidden onClick={this.logout}>Log Out</button>
            </Button>
          )}
          <Button variant="contained" component="label">
            Advanced Options
            <input type="checkbox" id="myCheckbox" name="myCheckbox" onChange={() => this.props.advanced(!advanced)} />
          </Button>
          {isLoggedIn && (
            <Button variant="contained" component="label">
              Upload New Photo
              <input hidden type="file" accept="image/*" ref={(domFileRef) => { this.uploadInput = domFileRef; }} onChange={this.handleUploadButtonClicked} />
            </Button>
          )}
          {isLoggedIn && (
            <Button href="#/activity" variant="contained">
              Activity
            </Button>
          )}
          <Typography>
            v.{version}
          </Typography>
          <Typography className="cs142-topbar-app-context">
            {appContext}
          </Typography>
        </Toolbar>
      </AppBar>
    );
  }
}

export default TopBar;
