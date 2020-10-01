import { Message } from 'discord.js';
import Util from '../../utils/functions/util';
import rest from '../../utils/functions/rest'
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';
import Queue from '../../utils/functions/queue';
import { MessageEmbed } from 'discord.js';

export default class PlayCommand extends BaseCommand {
  constructor() {
    super(
      'play', 
      'Music', 
      ['p', 'pl'],
      false,
      false
    );
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    const song = args.map(a => a).join(' ');
    let player = client.music.players.get(message.guild.id);
    const { channel } = message.member.voice;

    if (!song) return message.channel.send(`> ${client.emojiFinder(client, 'redtick').toString()} | No song Name/url provided!`);
    if (!player && (!channel || !channel.joinable)) return message.channel.send(`> ${client.emojiFinder(client, 'redtick').toString()} | I can not join your voice channel!`);
    if (message.guild.me.voice.channel && message.guild.me.voice.channel.id !== channel.id)
      return message.channel.send(`> ${client.emojiFinder(client, 'redtick').toString()} | We are not in the same voice channel, please join \`${message.guild.me.voice.channel.name}\`!`);
    
      const result = await rest.search(
      song.includes('https://') 
        ? encodeURI(song)
        : `ytsearch:${encodeURIComponent(song)}`
    );
    if (!result.tracks.length)
      return message.channel.send(
        `> ${client.emojiFinder(client, 'redtick').toString()} | No search results where found for your search query.`
      );

    player = client.music.players.get(message.guild.id) || client.music.create(message.guild.id);
    if (!player.queue) player.queue = new Queue(player);

    switch (result.loadType) {
      case 'TRACK_LOADED':
        player.queue.add(result.tracks[0].track, message.author.id);
        if (!player.connected) player.connect(channel.id, { selfDeaf: true });
        if (!player.playing && !player.paused) await player.queue.start(message);
        return message.channel.send(
          `> 🎵 | Enqueuing the song **${result.tracks[0].info.title}**!`
        );

      case 'PLAYLIST_LOADED':
        result.tracks.forEach(t => player.queue.add(t.track, message.author.id));
        if (!player.connected) player.connect(channel.id, { selfDeaf: true });
        if (!player.playing && !player.paused) await player.queue.start(message);
        return message.channel.send(
          `> 🎵 | Enqueuing the playlist **${result.playlistInfo.name}** - \`${result.tracks.length}\` Song(s).`
        );
      
      case 'SEARCH_RESULT':
        const embed = new MessageEmbed()
          .setTitle(`Search Result for ${song}`)
          .setDescription(result.tracks.slice(0, 10).map((t, i: number) => `**${i + 1}.** [${t.info.title}](${t.info.uri})`))
          .setColor(message.member.displayHexColor || 'BLUE')

        await message.channel.send(embed);

        const collector = message.channel.createMessageCollector((m: Message) => {
          return m.author.id === message.author.id && new RegExp(`^([1-9]|10|cancel)$`, 'i').test(m.content);
        }, { time: 30000, max: 1});

        collector.on("collect", async (m: Message) => {
          if (/cancel/i.test(m.content)) return collector.stop('cancelled');

          const track = result.tracks[Number(m.content) - 1];
          player.queue.add(track, message.author.id);

          if (!player.connected) player.connect(channel.id, { selfDeaf: true });
          if (!player.playing && !player.paused) await player.queue.start(message);

          return message.channel.send(`> 🎵 | Enqueuing the song **${track.info.title}**!`);
        });

        collector.on("end", (_, reason) => {
          if (['time'].includes(reason)) return message.channel.send(`> ${client.emojiFinder(client, 'redtick').toString()} | Prompt closed | no response within 30 seconds`);
          if (['cancelled'].includes(reason)) return message.channel.send(`> ${client.emojiFinder(client, 'redtick').toString()} | Prompt closed | User canceled prompt`);
        });
    }  
  }
}