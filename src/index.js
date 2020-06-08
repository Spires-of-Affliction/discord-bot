const { Client } = require('discord.js');
const client = new Client();

require('dotenv').config();

const alertDevelopers = ({ embeds, channel }) => {
  const send = (msg) => channel.send(`<@&${process.env.ROLE_ID}>\n${msg}`);

  if (embeds[0].description.includes('Merge')) return send('Merge Alert!');

  if (embeds.title.includes('master'))
    return send('Changes commited to master branch!');
};

function handleMessage(msg) {
  if (msg.channel.name === 'github' && msg.author.username === 'GitHub')
    alertDevelopers(msg);
}

client.on('message', handleMessage);

client.on('ready', () => console.log(client.user.tag));

client.login(process.env.TOKEN);
