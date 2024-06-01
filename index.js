/* #region setting up stuff. */
const express = require('express');
const session = require('express-session');
const url = require('url');
const app = express();

const CLIENT_ID = 'yz5hk39z6179x5nw424679nbe4drjv';
const REDIRECT_URI = 'http://localhost:3055/token';
const PORT = 3055;
const PARAMS = new URLSearchParams({
  "response_type" : "code",
  "client_id" : CLIENT_ID,
  "redirect_uri" : REDIRECT_URI,
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

app.get("/token", async (req, res) => {
  const access_token = req.query.code;
  const scope = req.query.scope;

  req.session.access_token = access_token;
  req.session.scope = scope;

  res.redirect("/auth");
});

app.get("/auth", (req, res) => {
  res.send({
    data: {
      access_token: req.session.access_token,
      scope: req.session.scope,
    }
  });
});

app.listen(PORT, () => {
  console.log("Listening on port: " + PORT + "!");
});
