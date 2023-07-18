import React from 'react';
//import './userDetail.css';
//import fetchModel from '../../lib/fetchModelData';
import axios from 'axios';


/**
 * Define UserDetail, a React componment of CS142 project #5
 */
class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      comments: null
    };
  }

  /*
  componentDidUpdate(prevProps) {
    if (prevProps === null) {
      return;
    }
    if (this.props.match.params.userId !== prevProps.match.params.userId) {
      const url = "http://localhost:3000/user/" + this.props.match.params.userId;
      axios.get(url)
        .then(response => {
          const user = response.data;
          this.setState({ user });
          const ret = user.first_name + " " + user.last_name;
          this.props.onNewInfo(ret);
        })
        .catch(error => {
          console.error(error);
        });
    }
  }
*/

  componentDidMount() {
    const url = "http://localhost:3000/commentsOfUser/" + this.props.match.params.userId;
    axios.get(url)
        .then(response => {
          const comments = response.data;
          this.setState({ comments });
        })
        .catch(error => {
          console.error(error);
        });
  }

  render() {
    const { comments } = this.state;
    //let user = window.cs142models.userModel(this.props.match.params.userId);

    if (!comments) {
      return <div>Loading...</div>;
    }
    return (
      <div>
        Hi
      </div>
    );
  }
}

export default UserDetail;
