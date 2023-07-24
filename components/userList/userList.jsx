import React from 'react';
import {
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Typography,
}
  from '@mui/material';
import './userList.css';
//import fetchModel from '../../lib/fetchModelData';
import axios from 'axios';

/**
 * Define UserList, a React componment of CS142 project #5
 */
class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      list: null,
      photoCounts: {},
      commentCounts: {},
    };
  }

  handlePhotoCount(user_id, count) {
    // update the photoCounts state variable with the new count
    this.setState(prevState => ({
      photoCounts: {
        ...prevState.photoCounts,
        [user_id]: count,
      }
    }));
  }

  handleCommentCount(user_id, count) {
    // update the photoCounts state variable with the new count
    this.setState(prevState => ({
      commentCounts: {
        ...prevState.commentCounts,
        [user_id]: count,
      }
    }));
  }

  componentDidUpdate() {
    if (!this.props.state.isLoggedIn) {
      return;
    }
    if (this.props.state.refreshUserList) {
      console.log("refetching user list");
      this.props.setRefreshUsers(false);
      let url = "http://localhost:3000/user/list";
      axios.get(url)
        .then(response => {
          const list = response.data;
          this.setState({ list });
          for (let i = 0; i < list.length; i++) {
            url = "http://localhost:3000/countPhotosOfUser/" + list[i]._id;
            axios.get(url)
              .then(response1 => {
                const photoCount = response1.data;
                this.handlePhotoCount(list[i]._id, photoCount);
              })
              .catch(error => {
                console.error(error);
              });

            url = "http://localhost:3000/commentsOfUser/" + list[i]._id;
            axios.get(url)
              .then(response2 => {
                const comments = response2.data;
                const commentCount = comments.length;
                this.handleCommentCount(list[i]._id, commentCount);
              })
              .catch(error => {
                console.error(error);
              });
          }
        }
        )
        .catch(error => {
          console.error(error);
        });
    }
  }

  render() {
    const { list, photoCounts, commentCounts } = this.state;
    if (!this.props.state.isLoggedIn) {
      return <div>Log in to see user list.</div>;
    }
    if (!list) {
      return <div>Loading...</div>;
    }
    const list2 = [];
    let index = 0;
    for (let i = 0; i < list.length; i++) {
      let href = "#/users/" + list[i]._id;
      if (this.props.advancedState) {
        list2[index++] = (
          <ListItemButton key={index} href={href}>
            <ListItemText primary={list[i].first_name} secondary={list[i].last_name} />
            <div className="cs142-photo-count-bubble">{photoCounts[list[i]._id]}</div>
            <div className="cs142-comment-count-bubble">{commentCounts[list[i]._id]}
            </div>
          </ListItemButton>
        );
      } else {
        list2[index++] = (
          <ListItemButton key={index} href={href}>
            <ListItemText primary={list[i].first_name} secondary={list[i].last_name} />
          </ListItemButton>
        );
      }
      list2[index++] = <Divider key={index} />;
    }
    // make each list item a link to route to #userID
    return (
      <div>
        <Typography>User List</Typography>
        <List component="nav">
          {list2}
        </List>
      </div>
    );
  }
}

export default UserList;
