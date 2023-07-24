import React from 'react';
import {
  Typography,
  Paper
} from '@mui/material';
import './userPhotos.css';
import { MentionsInput, Mention } from 'react-mentions';
import axios from 'axios';
import DOMPurify from 'dompurify';


/**
 * Define UserPhotos, a React componment of CS142 project #5
 */
class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      listPhotos: null,
      photoCount: 0,
      userList: null,
      inputArr: [],
    };
  }

  componentDidUpdate(prevProps) {
    let userId = this.props.match.params.userId;
    if (this.state.photoCount !== this.props.state.photoUploadCount) {
      let url = "http://localhost:3000/photosOfUser/" + userId;
      axios.get(url)
        .then(response => {
          const listPhotos = response.data;
          this.setState({ listPhotos });
        })
        .catch(error => {
          if (error.response.data === 'no photos found') {
            console.log("no photos found");
          } else {
            console.error(error);
          }
        });
      this.setState({ photoCount: this.props.state.photoUploadCount });
      return;
    }
    if (prevProps.match.params.userId === this.props.match.params.userId) {
      return;
    }
    let url = "http://localhost:3000/photosOfUser/" + userId;
    axios.get(url)
      .then(response => {
        const listPhotos = response.data;
        this.setState({ listPhotos });
      })
      .catch(error => {
        if (error.response.data === 'no photos found') {
          console.log("no photos found");
        } else {
          console.error(error);
        }
      });
    this.setState({ photoCount: this.props.state.photoUploadCount });
  }

  componentDidMount() {
    let url = "http://localhost:3000/photosOfUser/" + this.props.match.params.userId;
    axios.get(url)
      .then(response => {
        const listPhotos = response.data;
        this.setState({ inputArr: Array(listPhotos.length).fill("") });
        this.setState({ listPhotos });
      })
      .catch(error => {
        if (error.response.data === 'no photos found') {
          console.log("no photos found");
        } else {
          console.error(error);
        }
      });
    // Need to grab user data for the edge case where the user photos page is reloaded
    url = "http://localhost:3000/user/" + this.props.match.params.userId;
    axios.get(url)
      .then(response => {
        const user = response.data;
        this.props.onNewInfo(user);
      })
      .catch(error => {
        console.error(error);
      });
    url = "http://localhost:3000/user/list";
    axios.get(url)
      .then(response => {
        const userList = response.data;
        this.setState({ userList });
      })
      .catch(error => {
        console.error(error);
      });
  }

  render() {
    const { listPhotos, userList } = this.state;
    const switchView = "#/users/" + this.props.match.params.userId;
    const photoElements = [];

    if (!listPhotos || !userList) {
      return (
        <div>
          <Typography>
            <a className="cs142-switch-view" href={switchView}>Show User Details</a>
          </Typography>
          <div> No photos yet.</div>
        </div>
      );
    }

    const formattedUserList = userList.map(user => ({
      //id: `${user.first_name} ${user.last_name}`,
      id: user._id,
      display: `${user.first_name} ${user.last_name}`
    }));


    for (let i = 0; i < listPhotos.length; i++) {
      const photo = listPhotos[i];
      const photoSrc = "images/" + photo.file_name;
      const commentList = photo.comments;

      const submitCommentForPhoto = (event) => {
        event.preventDefault();
        let newComment = this.state.inputArr[i];
        newComment = DOMPurify.sanitize(newComment, {ALLOWED_TAGS: []});
        let idArray = newComment.match(/\((\w+)\)/g);
        if (idArray !== null) {
          idArray = idArray.map(str => str.slice(1, -1));
        }
        const comment = newComment;
        let url = "http://localhost:3000/commentsOfPhoto/" + photo._id;

        axios.post(url, { comment })
          .then(() => {
            url = "http://localhost:3000/photosOfUser/" + this.props.match.params.userId;
            axios.get(url)
              .then(response => {
                url = "http://localhost:3000/addMention/" + photo._id;
                if (idArray) {
                  for (const id of idArray){
                    axios.post(url, {mentionId: id})
                      .then(() => {
                        const newListPhotos = response.data;
                        this.setState({ listPhotos: newListPhotos });
                      })
                      .catch(error => {
                        console.error(error);
                      });
                  }
                } else {
                  const newListPhotos = response.data;
                  this.setState({ listPhotos: newListPhotos });
                }
              })
              .catch(error => {
                console.error(error);
              });
            //event.target.comment.value = "";
            const newArray = this.state.inputArr.map((element, index) => {
              if (index === i) {
                return "";
              } else {
                return element;
              }
            });
            this.setState({ inputArr: newArray });
            console.log(photo);
            const name = this.props.state.loggedInUser.first_name + " " + this.props.state.loggedInUser.last_name;
            axios.post('/addActivity', {date_time: Date.now, user_name: name, activity_type: "Comment added.", file_name: photo.file_name});
          })
          .catch(error => {
            console.error(error);
          });
      };

      //const regex = /@\[([^\]]+)\]\((\w+)\)/g; // a regular expression to match @[username](id) mentions
      const regex = /@\[([^\]]+)\]\((\S+)\)/g;

      const photoElement = (
        <Paper key={i} elevation={12} className="cs142-photo-paper">
          <img className="cs142-photo-photo" src={photoSrc} alt={photo.file_name} />
          <Typography>Posted: {photo.date_time}</Typography>

          {commentList && (
            <div className="cs142-photos-commentBlock">
              {commentList.map((comment, j) => (
                <Typography key={j} className="cs142-photos-comment">
                  {comment.date_time.toLocaleString()} 
                  <a href={`#/users/${comment.user._id}`}>
                    {comment.user.first_name} {comment.user.last_name}: 
                  </a> 
                  {comment.comment.split(regex).map((part, index) => {
                    if (index % 3 === 0) {
                      return <span key={index}>{part}</span>;
                    } else if (index % 3 === 1) {
                      const username = part;
                      const num = Math.floor(index / 3);
                      const curMention =  comment.comment.match(regex)[num];
                      const match = curMention.match(/@\[[^\]]+\]\((\w+)\)/);
                      const id = match[1];
                      const href = `#/users/${id}`;
                      return <a key={index} className="cs142-mention" href={href}>@{username}</a>;
                    }
                    return null;
                  })}
                </Typography>
              ))}
            </div>
          )}

          
          
          <form onSubmit={submitCommentForPhoto}>
            <MentionsInput
              singleLine
              value={this.state.inputArr[i]}
              onChange={e => {
                const newArray = this.state.inputArr.map((element, index) => {
                  if (index === i) {
                    return e.target.value;
                  } else {
                    return element;
                  }
                });
                this.setState({ inputArr: newArray });
              }}
              placeholder="Add a comment"
              name="comment"
            >
              <Mention
                trigger="@"
                //displayTransform={(display) => `@${display}`}
                data={formattedUserList}
                style={{ backgroundColor: '#ddd' }}
                renderSuggestion={(suggestion, search, highlightedDisplay) => (
                  <div className="user">
                    {highlightedDisplay}
                  </div>
                )}
              />
            </MentionsInput>

            <button type="submit">Submit</button>
          </form>
        </Paper>
      );
      photoElements.push(photoElement);
    }
    return (
      <div>
        <Typography>
          <a className="cs142-switch-view" href={switchView}>Show User Details</a>
        </Typography>
        <div className="cs142-photos-all">{photoElements}</div>
      </div>
    );
  }
}

export default UserPhotos;
