const WebSocket = require('ws');
const { Client } = require('discord.js');

require('dotenv').config();

const {
  DEVELOPER_ROLE_ID: developerRoleID,
  GITHUB_WEBHOOK_NAME: githubWebhookName,
  GITHUB_WEBHOOK_CHANNEL: githubWebhookChannel,
  TOKEN: token,
  PORT: port,
  GUILD_ID: guildID,
  CHANNEL_ID: channelID,
} = process.env;

const server = new WebSocket.Server({ port });
const client = new Client();

console.log(`WebSocket server running!\nws://localhost:${port}`);

const findChannel = () => {
  const guild = client.guilds.cache.find(({ id }) => id === guildID);
  if (!guild) throw Error('findChannel: Guild not found.');

  const channel = guild.channels.cache.find(({ id }) => id === channelID);
  if (!channel) throw Error('findChannel: Channel not found.');

  return channel;
};

const handleSocketEvent = (msg) => {
  switch (msg) {
    case 'cloud::modified':
      alertEveryone('Cloud storage has been updated!');
      break;
  }
};

server.on('connection', (ws) => {
  ws.on('message', (msg) => handleSocketEvent(msg));
});

const alertEveryone = (msg) => {
  const channel = findChannel();

  channel.send(`@everyone\n${msg}`);
};

const alertDevelopers = ({ embeds, channel }) => {
  const [embed] = embeds;
  const send = (msg) => channel.send(`<@&${developerRoleID}>\n${msg}`);

  if (embed.description.includes('Merge')) return send('Merge Alert!');

  if (embed.title.includes('master'))
    return send('Changes commited to master branch!');
};

const handleMessage = (msg) => {
  if (
    msg.channel.name === githubWebhookChannel &&
    msg.author.username === githubWebhookName
  )
    alertDevelopers(msg);
};

client.on('message', handleMessage);

client.on('ready', () => console.log(client.user.tag));

client.login(token);
