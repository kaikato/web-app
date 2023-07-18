import React from 'react';
import ReactDOM from 'react-dom';
import {
  HashRouter, Route, Switch, Redirect
} from 'react-router-dom';
import {
  Grid, Paper
} from '@mui/material';
import './styles/main.css';

// import necessary components
import TopBar from './components/topBar/TopBar';
import UserDetail from './components/userDetail/userDetail';
import UserList from './components/userList/userList';
import UserPhotos from './components/userPhotos/userPhotos';
import LoginRegister from './components/login-register/login-register';
import Activity from './components/activity/activity';

class PhotoShare extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUser: '',
      advancedFeatures: false,
      isLoggedIn: false,
      loggedInUser: '',
      photoUploadCount: 0,
      refreshUserList: false,
    };
  }
  
  setUser = (newUser) => {
    this.setState({ currentUser: newUser });
  };

  setAdvancedFeatures = (advanced) => {
    this.setState({ advancedFeatures: advanced });
  };

  setLoggedInUser = (user) => {
    this.setState({loggedInUser: user});
  };

  setLoggedIn = (bool) => {
    this.setState({ isLoggedIn: bool });
  };

  setRefreshUserList = (bool) => {
    this.setState({refreshUserList: bool});
  };

  addPhotoUploadCount = () => {
    let ct = this.state.photoUploadCount;
    this.setState({photoUploadCount: ct + 1});
  };

  render() {
    return (
      <HashRouter>
        <div>
          <Grid container spacing={8}>
            <Grid item xs={12}>
              <Switch>
                <Route path="/users/:userId"
                  render={props => <TopBar onNewInfo={this.setUser} onNewLogin={this.setLoggedIn} advanced={this.setAdvancedFeatures} incrementCount={this.addPhotoUploadCount} state={this.state} context={"user"} {...props} />}
                />
                <Route path="/photos/:userId"
                  render={props => <TopBar onNewInfo={this.setUser} onNewLogin={this.setLoggedIn} advanced={this.setAdvancedFeatures} incrementCount={this.addPhotoUploadCount} state={this.state} context={"photos"} {...props} />}
                />
                <Route path="/users"
                  render={props => <TopBar onNewInfo={this.setUser} onNewLogin={this.setLoggedIn} advanced={this.setAdvancedFeatures} incrementCount={this.addPhotoUploadCount} state={this.state} context={"User List"} {...props} />} />
                <Route path="/activity"
                  render={props => <TopBar onNewInfo={this.setUser} onNewLogin={this.setLoggedIn} advanced={this.setAdvancedFeatures} incrementCount={this.addPhotoUploadCount} state={this.state} context={"Recent Activity"} {...props} />} />
                <Route path="/"
                  render={props => <TopBar onNewInfo={this.setUser} onNewLogin={this.setLoggedIn} advanced={this.setAdvancedFeatures} incrementCount={this.addPhotoUploadCount} state={this.state} context={"Login Page"} {...props} />} />
              </Switch>
            </Grid>
            <div className="cs142-main-topbar-buffer" />
            <Grid item sm={3}>
              <Paper className="cs142-main-grid-item">
                <UserList onNewInfo={this.setUser} setRefreshUsers={this.setRefreshUserList} state={this.state} />
              </Paper>
            </Grid>
            <Grid item sm={9}>
              <Paper className="cs142-main-grid-item">
                <Switch>
                  ({
                    this.state.isLoggedIn ? (
                      <Route path="/users/:userId"
                        render={props => <UserDetail onNewInfo={this.setUser} user={this.state.currentUser} loggedInUser={this.state.loggedInUser} {...props} />}
                      />
                    )
                      :
                      <Redirect path="/users/:userId" to="/login-register" />
                  })
                  ({
                    this.state.isLoggedIn   ? (
                      <Route path="/photos/:userId"
                        render={props => <UserPhotos onNewInfo={this.setUser} user={this.state.currentUser} state={this.state} {...props} />}
                      />
                    )
                      :
                      <Redirect path="/photos/:userId" to="/login-register" />
                  })
                  ({
                    this.state.isLoggedIn  ? (
                      <Route path="/users"
                        render={props => <UserList advancedState={this.state.advancedFeatures} {...props} />}
                      />
                    )
                      :
                      <Redirect path="/users" to="/login-register" />
                  })
                  ({
                    this.state.isLoggedIn  ? (
                      <Route path="/activity"
                        render={props => <Activity advancedState={this.state.advancedFeatures} {...props} />}
                      />
                    )
                      :
                      <Redirect path="/activity" to="/login-register" />
                  })
                  <Route path="/login-register"
                        render={props => <LoginRegister onNewLogin={this.setLoggedIn} setUser={this.setLoggedInUser} rereshUsers={this.state.refreshUserList} setRefreshUsers={this.setRefreshUserList} state={this.state} {...props} />}
                      />
                  <Redirect path="/" to="/login-register" />
                </Switch>
              </Paper>
            </Grid>
          </Grid>
        </div>
      </HashRouter>
    );
  }
}


ReactDOM.render(
  <PhotoShare />,
  document.getElementById('photoshareapp'),
);
