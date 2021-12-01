import React from "react";
import { Box, TextField, Button, Grid, Backdrop, CircularProgress } from '@mui/material';
// import env from "react-dotenv"
import dotenv from 'dotenv'

var axios = require('axios');

const style = {
  inputProps: {
    style: { textAlign: "center" },
  }
}
class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      site_url: "",
      feed_url: "",
      // accuracy: { type: "", value: 0 }, 
      result: -1 // -1 nothing, 1 not spam, 0 spam
    }
  }
  urlFetcher = () => {
    let url = "";
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.message === "RECIEVE URL") {
        this.setState({ site_url: request.url, feed_url: request.url })
      }
    })
    chrome.runtime.sendMessage({ message: "GET URL" })
    this.setState({ site_url: url, feed_url: url })
  }

  onChangeUrl = (event) => {
    this.setState({ feed_url: event.target.value })
  }

  checkUrl = (url) => {
    this.setState({ loading: true }, () => {

      const config = {
        method: 'get',
        url: process.env.REACT_APP_AWS_PRED_URL + url,
        headers: { "Access-Control-Allow-Origin": "*" }
      };
      axios(config)
        .then(response => {
          console.log(response.data.output[0]);
          this.setState({ loading: false, result: response.data.output[0] })
          //Condition if it is phising website or not, Also what is accuracy for the result 
        });
    });
  }

  componentDidMount() {
    this.urlFetcher();
  }

  render() {
    const { loading, site_url, feed_url, result } = this.state;
    return (
      <>
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <Box sx={{ display: "flex", flexDirection: "column", margin: "0px", width: "100%", height: "100%" }}>
          <Box id="header" sx={{ display: "inline-flex", justifyContent: "center", height: 1.5 / 8 }}>
            <h3>Phishing Website Detector</h3>
          </Box>
          <Box sx={{ display: "inline-flex", justifyContent: "center", alignItems: "center", height: 2.75 / 4 }}>
            {result === -1
              ?
              <TextField fullWidth InputProps={style} id="url_input" placeholder="URL Input" label="URL Input" variant="outlined" onChange={this.onChangeUrl} value={feed_url} />
              :
              <>
                {result === 0
                  ?
                  <h4>It is a Phishing Website</h4>
                  :
                  <h4>Not A Phishing Webite</h4>}
              </>
            }
          </Box>
          <Box sx={{ display: "inline-flex", justifyContent: "space-around", height: 1.25 / 8 }}>
            {result === -1
              ?
              <>
                <Button variant="text" onClick={() => this.checkUrl(site_url)}>This Website</Button>
                <Button variant="contained" onClick={() => this.checkUrl(feed_url)}>From TextBox</Button>
              </>
              :
              <Button variant="outlined" onClick={() => { this.setState({ result: -1, feed_url: site_url }) }} >Back</Button>
            }
          </Box>
        </Box>
      </>
    )
  }
}
export default App;