import React from 'react';
import './activity.css';
import axios from 'axios';
import { Typography, Paper, Button } from '@mui/material';


/**
 * Define Activity, a React componment of CS142 project #5
 */
class Activity extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activityList: null,
    };
    this.refreshBound = event => this.refresh(event);
  }

  refresh() {
    const url = "http://localhost:3000/activityList/";
    axios.get(url)
      .then(response => {
        //console.log("got" + response);
        const activityList = response.data;
        this.setState({activityList});
      })
      .catch(error => {
        console.error(error);
      });
  }

  componentDidMount() {
    this.refresh();
  }

  render() {
    const { activityList } = this.state;
    if (!activityList) {
      return (
        <div>
          No activities yet.
        </div>
      );
    }
    const activityElements = [];
    for (let i = activityList.length-1; i >= 0 && i >= activityList.length-5; i--){
      const curActivity = activityList[i];
      const activityElement = (
        <Paper key={i} elevation={12} className="cs142-photo-paper">
          <Typography>{curActivity.date_time}</Typography>
          <Typography>User: {curActivity.user_name}</Typography>
          <Typography>{curActivity.activity_type}</Typography>
          {curActivity.file_name && (
            <img className="cs142-thumbnail-photo" src={"images/" + curActivity.file_name} />
          )}
        </Paper>
      );
      activityElements.push(activityElement);
    }
    return (
      <div className="cs142-activity-container">
        <Typography>Recent Activity</Typography>
        <div>
          <Button onClick={this.refreshBound} variant="contained">
            Refresh
          </Button>
        </div>
        {activityElements}
      </div>
    );
  }
}

export default Activity;
