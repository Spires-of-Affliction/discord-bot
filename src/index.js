const WebSocket = require('ws');
const { Client } = require('discord.js');

require('dotenv').config();

const {
  DEVELOPER_ROLE_ID: developerRoleID,
  TEAM_ROLE_ID: teamRoleID,
  GITHUB_WEBHOOK_NAME: githubWebhookName,
  GITHUB_WEBHOOK_CHANNEL: githubWebhookChannel,
  TOKEN: token,
  PORT: port,
  GUILD_ID: guildID,
  CHANNEL_ID: channelID,
} = process.env;

const server = new WebSocket.Server({ port });
const client = new Client();

const messageDelimiter = '::';

console.log(`WebSocket server running!\nws://localhost:${port}`);

const setActivity = () =>
  client.user.setActivity(
    `for changes ${server.clients.size > 0 ? `| ${server.clients.size}` : ''}`,
    {
      type: 'WATCHING',
    }
  );

const broadcast = (msg) => server.clients.forEach((client) => client.send(msg));

let pool = [];

const findChannel = () => {
  const guild = client.guilds.cache.find(({ id }) => id === guildID);
  if (!guild) throw Error('findChannel: Guild not found.');

  const channel = guild.channels.cache.find(({ id }) => id === channelID);
  if (!channel) throw Error('findChannel: Channel not found.');

  return channel;
};

const handleSocketEvent = (msg) => {
  console.log(msg);
  if (!msg.includes(messageDelimiter)) return;
  const [event, file] = msg.split(messageDelimiter);
  pool.push(`${event === 'unlink' ? '-' : '+'} ${file}`);
  console.log(`Added to pool: ${file}`);
};

server.on('connection', (ws, req) => {
  setActivity();
  console.log(`New connection: ${req.socket.remoteAddress}`);
  ws.on('close', setActivity);
  ws.on('message', handleSocketEvent);
});

const alertTeam = (msg) => {
  const channel = findChannel();

  channel.send(`<@&${teamRoleID}>\nPromjene u MEGA Cloud folderu\n${msg}`);
};

const alertDevelopers = ({ embeds, channel }) => {
  const [embed] = embeds;
  const send = (msg) => channel.send(`<@&${developerRoleID}>\n${msg}`);

  if (embed.description.includes('Merge')) return send('Izvrsen merge!');

  if (embed.title.includes('master')) return send('Promjene u master branchu!');
};

const handleMessage = (msg) => {
  if (
    msg.channel.name === githubWebhookChannel &&
    msg.author.username === githubWebhookName
  )
    alertDevelopers(msg);
};

client.on('message', handleMessage);

client.on('ready', () => {
  setActivity();
  console.log(client.user.tag);
});

client.login(token);

setInterval(() => {
  if (pool.length > 0) {
    alertTeam('```md\n' + pool.join('\n') + '```');
    pool = [];
    broadcast('backup');

    console.log('Pool has been cleared.\n');
  }
}, 30000);
