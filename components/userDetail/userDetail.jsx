import React from 'react';
import {
  Divider,
  Typography,
  Card, CardContent,
  Paper,
} from '@mui/material';
import './userDetail.css';
import axios from 'axios';


/**
 * Define UserDetail, a React componment of CS142 project #5
 */
class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      mentionedPhotos: [],
      userList: [],
      mostRecentPhoto: null,
      mostCommentedPhoto: null,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps === null) {
      return;
    }
    if (this.props.match.params.userId !== prevProps.match.params.userId) {
      const url = "/user/" + this.props.match.params.userId;
      axios.get(url)
        .then(response => {
          const user = response.data;
          this.setState({ user });
          this.props.onNewInfo(user);
        })
        .catch(error => {
          console.error(error);
        });
      const photosUrl = "/mentionsOfUser/" + this.props.match.params.userId;
      axios.get(photosUrl)
        .then(response => {
          const mentionedPhotos = response.data;
          this.setState({ mentionedPhotos });
        })
        .catch(error => {
          console.error(error);
        });
      const url1 = '/mostRecentPhoto/' + this.props.match.params.userId;
      axios.get(url1)
        .then(response => {
          const mostRecentPhoto = response.data;
          this.setState({ mostRecentPhoto });
        })
        .catch(error => {
          console.error(error);
        });
      const url2 = '/mostCommentedPhoto/' + this.props.match.params.userId;
      axios.get(url2)
        .then(response => {
          const mostCommentedPhoto = response.data;
          this.setState({ mostCommentedPhoto });
        })
        .catch(error => {
          console.error(error);
        });
    }
  }

  componentDidMount() {
    const url = "/user/" + this.props.match.params.userId;
    axios.get(url)
      .then(response => {
        const user = response.data;
        this.setState({ user });
        this.props.onNewInfo(user);
      })
      .catch(error => {
        console.error(error);
      });
    const photosUrl = "/mentionsOfUser/" + this.props.match.params.userId;
    axios.get(photosUrl)
      .then(response => {
        const mentionedPhotos = response.data;
        this.setState({ mentionedPhotos });
      })
      .catch(error => {
        console.error(error);
      });
    const userUrl = '/user/list';
    axios.get(userUrl)
      .then(response => {
        const userList = response.data;
        this.setState({ userList });
      })
      .catch(error => {
        console.error(error);
      });
    const url1 = '/mostRecentPhoto/' + this.props.match.params.userId;
    axios.get(url1)
      .then(response => {
        const mostRecentPhoto = response.data;
        this.setState({ mostRecentPhoto });
      })
      .catch(error => {
        console.error(error);
      });
    const url2 = '/mostCommentedPhoto/' + this.props.match.params.userId;
    axios.get(url2)
      .then(response => {
        const mostCommentedPhoto = response.data;
        this.setState({ mostCommentedPhoto });
      })
      .catch(error => {
        console.error(error);
      });
  }

  render() {
    const { user, mentionedPhotos, userList, mostRecentPhoto, mostCommentedPhoto } = this.state;

    if (!user || !userList || !mostRecentPhoto || !mostCommentedPhoto) {
      return <div>Loading...</div>;
    }
    const photoElements = [];
    const switchView = "#/photos/" + user._id;
    if (mentionedPhotos && userList) {
      for (let i = 0; i < mentionedPhotos.length; i++) {
        const photo = mentionedPhotos[i];
        const photoSrc = "images/" + photo.file_name;
        const photoPage = "#/photos/" + photo.user_id;
        const userPage = "#/users/" + photo.user_id;
        const person = userList.find(p => p._id === photo.user_id);
        if (person) {
          const { first_name, last_name } = person;
          const photoElement = (
            <Paper key={i} elevation={12} className="cs142-photo-paper">
              <a href={photoPage}>
                <img className="cs142-thumbnail-photo" src={photoSrc} alt={photo.file_name} />
              </a>
              <Typography>Posted: {photo.date_time}</Typography>
              <Typography><a href={userPage}>Posted by: {first_name} {last_name}</a></Typography>
            </Paper>
          );
          photoElements.push(photoElement);
        }
      }
    }

    if (mentionedPhotos.length === 0) {
      photoElements.push(
        <div key={0}>No mentioned Photos.</div>
      );
    }

    return (
      <div>
        <Typography><a className="cs142-switch-view" href={switchView}>Show Photos</a></Typography>
        <Card>
          <CardContent>
            <Typography className="cs142-detail-name">{user.first_name} {user.last_name}</Typography>
            <Divider />
            <Typography className="cs142-detail-location">Location: {user.location}</Typography>
            <Divider />
            <Typography className="cs142-detail-description">Description: {user.description}</Typography>
            <Typography className="cs142-detail-occupation">Occupation: {user.occupation}</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography className="cs142-detail-recent">Most recent upload</Typography>
            <Paper elevation={12} className="cs142-photo-paper">
              <a href={"#/photos/" + mostRecentPhoto.user_id}>
                <img className="cs142-thumbnail-photo" src={"images/" + mostRecentPhoto.file_name} alt={mostRecentPhoto.file_name} />
              </a>
              <Typography>Posted: {mostRecentPhoto.date_time}</Typography>
            </Paper>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography >Most commented photo</Typography>
            <Paper elevation={12} className="cs142-photo-paper">
              <a href={"#/photos/" + mostCommentedPhoto.user_id}>
                <img className="cs142-thumbnail-photo" src={"images/" + mostCommentedPhoto.file_name} alt={mostCommentedPhoto.file_name} />
              </a>
              <Typography>Number of comments: {mostCommentedPhoto.comments.length}</Typography>
            </Paper>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography className="cs142-detail-mentioned">Mentioned Photos</Typography>
            <div>
              {photoElements}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}

export default UserDetail;
