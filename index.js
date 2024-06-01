/* #region setting up stuff. */
const express = require('express');
const session = require('express-session');
const axios = require('axios');
const url = require('url');
const app = express();
require('dotenv').config();

const PORT = 3055;
const PARAMS = new URLSearchParams({
  "response_type" : "code",
  "client_id" : process.env.CLIENT_ID,
  "redirect_uri" : process.env.REDIRECT_URI,
  "scope" : "channel:bot channel:moderate chat:edit chat:read",
}).toString();

app.use(session({
  secret: '126139ab-378f-44c8-a529-7ef5dbe55f36',
  resave: false,
  saveUninitialized: false
}));

/* #endregion setting up stuff. */

app.get("/", (req, res) => {
  res.redirect(`https://id.twitch.tv/oauth2/authorize?${PARAMS}`);
});

// app.get("/token", async (req, res) => {
//   const access_token = req.query.code;
//   const scope = req.query.scope;

//   req.session.access_token = access_token;
//   req.session.scope = scope;

//   res.redirect("/auth");
// });

app.get("/token", async (req, res) => {
  try {
    const { code } = req.query;
    const tokenResponse = await axios.post('https://id.twitch.tv/oauth2/token', null, {
        params: {
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            code,
            grant_type: 'authorization_code',
            redirect_uri: process.env.REDIRECT_URI
        }
    });
    const access_token = tokenResponse.data.access_token;
    req.session.access_token = access_token;
    res.redirect("/auth");
  } catch (error) {
      console.error('Error during authentication:', error);
      res.status(500).send('Error during authentication');
  }
});

// app.get("/auth", (req, res) => {
//   res.send({
//     data: {
//       access_token: req.session.access_token,
//       scope: req.session.scope,
//     }
//   });
// });

app.get("/auth", (req, res) => {
  res.send({
    data: {
      access_token: req.session.access_token,
    }
  });
});

app.listen(PORT, () => {
  console.log("Listening on port: " + PORT + "!");
});
