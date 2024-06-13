/* #region local database */
var firstData = ["noone atm"];
var titlegenData = [];
/* #endregion local database */

/* #region importing packages */
const express = require('express');
const session = require('express-session');
const tmi = require('tmi.js');
const axios = require('axios');
const app = express();
require('dotenv').config();
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

const {
	printWords,
	printEmojis
} = require("./scripts/titlegen.js");

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
/* #endregion importing packages */

/* #region twitch bot connection */
const client = new tmi.Client({
	options: { debug: true },
	identity: {
		username: process.env.BOT_USERNAME,
		password: process.env.OAUTH_TOKEN
	},
	channels: [ process.env.CHANNEL_NAME ]
});

client.connect();
/* #endregion twitch bot connection*/

/* #region routing */
app.get("/", (req, res) => {
  res.redirect(`https://id.twitch.tv/oauth2/authorize?${PARAMS}`);
});

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
		req.session.code = code;
		req.session.access_token = access_token;
		res.redirect("/auth");
	} catch (error) {
		console.error('Error during authentication:', error);
		res.status(500).send('Error during authentication');
	}
});

app.get("/auth", (req, res) => {
	res.send({
		data: {
		authcode: req.session.code,
		access_token: req.session.access_token,
		}
	});
});

app.get("/first", (req, res) => {
	firstData[0] = req.query.user;
	res.render("first", {data: firstData[0]});
});

app.get("/titlegen", (req, res) => {
	res.render("titlegen", {data: titlegenData[0]});
});
  
app.listen(PORT, () => {
	console.log("Listening on port: " + PORT + "!");
});
/* #endregion routing */

/* #region commands */
client.on('message', (channel, tags, message, self) => {
	const command = message.toLowerCase();
	if(self) return;

	if(command === 'test') {
		client.say(channel, "test");
	}

	if(command === '!whofirst') {
		client.say(channel, firstData[0] + " was first froogyBirthday");
	}

	if(command.startsWith('!titlegen')) {
		if(
			tags.badges.broadcaster
		) {
			titlegenCmd(channel, command);
		} else {
			console.log(tags);
			client.say(channel, "hey .. you're not eoh 😡");
		}
	}
});
/* #endregion commands */

/* #region command logic */
function firstCmd(channel, message) {
	firstData[0] = message.split(" ")[1];
}

function titlegenCmd(channel, message) {
	//Custom Title
	let titlestr = "";
	let arr = message.split(" ");
	if (arr[2]) {
		for (let i = 2; i < arr.length; i++) {
			titlestr += arr[i];
			if (i < arr.length - 1) {
				titlestr += " ";
			}
		}
		titlegenData[1] = titlestr;
	}
	console.log(titlestr);

	/*
	empty: [mic on], and random.
	off: [mic off], and random.
	Option 2: custom.
	*/
	switch(arr[1]) {
		case "off":
			titlegenData[1] = printWords();
			titlegenData[2] = printEmojis();
			titlegenData[0] = "[mic off] " + titlegenData[1] + " "
				+ titlegenData[2];
			client.say(channel, "generated title🖨, with mic-off 🎤❌");
			console.log({
				mode: "off",
				custom: "false",
				data: titlegenData[0]
			});
			break;
		
		case "toggleoff":
			titlegenData[0] = "[mic off] " + titlegenData[1] + " "
				+ titlegenData[2];
				client.say(channel, `title shows mic "off" 🎤❌ now in overlay🖨`);
			console.log({
				mode: "off",
				custom: "false",
				data: titlegenData[0]
			});
			break;

		case "toggleon":
			titlegenData[0] = "[mic on] " + titlegenData[1] + " "
				+ titlegenData[2];
				client.say(channel, `title shows mic "on" 🎤✅ now in overlay🖨`);
			console.log({
				mode: "off",
				custom: "false",
				data: titlegenData[0]
			});
			break;
		
		case "customon":
			titlegenData[2] = printEmojis();
			titlegenData[0] = "[mic on] " + titlegenData[1] + " "
				+ titlegenData[2];
			client.say(channel, "generated custom title🖨, with mic-on 🎤✅");
			console.log({
				mode: "off",
				custom: "true",
				data: titlegenData[0]
			});
			break;

		case "customoff":
			titlegenData[2] = printEmojis();
			titlegenData[0] = "[mic off] " + titlegenData[1] + " "
				+ titlegenData[2];
			client.say(channel, "generated custom title🖨, with mic-off 🎤❌");
			console.log({
				mode: "on",
				custom: "true",
				data: titlegenData[0]
			});
			break;

		case "what":
			client.say(channel, "/me the title is ...");
			client.say(channel, titlegenData[1] + " " + titlegenData[2]);
			break;
		
		case "set":
			client.say(channel, "!settitle " + titlegenData[1] + " "
				+ titlegenData[2]);
			break;

		default:
			titlegenData[1] = printWords();
			titlegenData[2] = printEmojis();
			titlegenData[0] = "[mic on] " + titlegenData[1] + " "
				+ titlegenData[2];
			client.say(channel, "generated title🖨, with mic-on 🎤✅");
			console.log({
				mode: "on",
				custom: "false",
				data: titlegenData[0]
			});
			break;
	};
}
/* #endregion command logic */