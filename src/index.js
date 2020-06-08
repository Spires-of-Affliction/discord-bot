const WebSocket = require('ws');
const { Client } = require('discord.js');

require('dotenv').config();

const {
  DEVELOPER_ROLE_ID,
  GITHUB_WEBHOOK_NAME,
  GITHUB_WEBHOOK_CHANNEL,
  TOKEN,
  PORT: port,
} = process.env;

const server = new WebSocket.Server({ port });
const client = new Client();

server.on('connection', (ws) => {
  ws.on('message', (msg) => console.log(msg));
});

const alertDevelopers = ({ embeds, channel }) => {
  const [embed] = embeds;
  const send = (msg) => channel.send(`<@&${DEVELOPER_ROLE_ID}>\n${msg}`);

  if (embed.description.includes('Merge')) return send('Merge Alert!');

  if (embed.title.includes('master'))
    return send('Changes commited to master branch!');
};

const handleMessage = (msg) => {
  if (
    msg.channel.name === GITHUB_WEBHOOK_CHANNEL &&
    msg.author.username === GITHUB_WEBHOOK_NAME
  )
    alertDevelopers(msg);
};

client.on('message', handleMessage);

client.on('ready', () => console.log(client.user.tag));

client.login(TOKEN);
