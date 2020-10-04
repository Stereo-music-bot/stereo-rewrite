import { Message, MessageEmbed } from 'discord.js';
import { EventEmitter } from 'events';
import { Player } from 'lavaclient';
import Util from './util';
import rest from './rest';

interface QueueObject {
    track: string;
    requester: string;
}
  
interface RepeatObject {
    song: boolean;
    queue: boolean;
    always: boolean;
}

export default class Queue extends EventEmitter {
    public next: QueueObject[] = [];
    public previous: QueueObject[] = [];
    public current: QueueObject;
    public repeat: RepeatObject = { song: false, queue: false, always: false };
    private message: Message;

    public constructor(public player: Player) {
        super();

        player
            .on('end', async (tet) => {
                if (tet && ["REPLACED", "STOPPED"].includes(tet.reason)) return;
                if (this.repeat.song) this.next.unshift(this.current);
                else if (this.repeat.queue || this.repeat.always) this.previous.push(this.current);

                if (this.message.guild.me.voice.channel.members.size === 1 && !this.repeat.always) return this.emit('finished', 'Alone');
                
                this._next();

                if (!this.current) return this.emit('finished', 'emptyQueue');
                await player.play(this.current.track);
            })
            .on('start', async (sevt) => {
                if (!sevt) return;

                const { title, identifier, uri, length } = await rest.decode(sevt.track);

                const embed = new MessageEmbed()
                    .setTitle(`Now Playing ${title}`)
                    .setDescription([
                        `> 🎵 | **Song**: [${title}](${uri})`,
                        `> 👤 | **Requested By**: ${this.message.guild.members.cache.get(this.current.requester).toString()}`,
                        `> ⌚ | **Duration**: \`${Util.formatTime(Number(length))}\``
                    ])
                    .setThumbnail(`https://i.ytimg.com/vi/${identifier}/hqdefault.jpg`)
                    .setColor(this.message.guild.members.cache.get(this.current.requester).displayHexColor || 'BLUE')
                return this.message.channel.send(embed);
            })
            .on('stuck', () => {
                this.message.channel.send(
                    `> <:redtick:749587325901602867> | The player is stuck on the song: **${this.current.track}**. I will skip this song now.`
                );
                return this._next();
            })
            .on('error', (e) => {
                this.message.channel.send(
                    `> <:redtick:749587325901602867> | An error occured while playing **${this.current.track}**: ${e.exception.message || 'UN EXPECTED LOADING ERROR'}`
                );
                return this._next();
            });
            this.on('finished', async (reason: string) => {
                if (this.repeat.queue || this.repeat.always) {
                    this.next.push(...this.previous);
                    this.previous = [];
                    return await this.start(this.message);
                };

                switch (reason) {
                    case 'Alone':
                        if (this.repeat.always) return;

                        this.message.channel.send(
                            `> 👤 | It looks like I am the only one in the voice channel, I will leave it now...`
                        );
                        return await this.clear();
                
                    case 'empty':
                    default:
                        this.message.channel.send(
                            `> 🔇 | The queue is empty, I will leave the voice channel now...`
                        );
                        return await this.clear();
                    
                    case 'disconnect':
                        this.message.channel.send(
                            `> 👋 | Disconnected from the voice channel, I will cleare the queue now...`
                        );
                        return await this.clear();
                };
            });
        
    };

    public _next() {
        return (this.current = this.next.shift());
    };

    public async clear() {
        this.next = [];
        this.previous = [];
        this.repeat = { song: false, queue: false, always: false };
    
        return await this.player.manager.destroy(
          this.message.guild.id ?? this.player.guild
        );
    };
    
    public async start(message: Message) {
        this.message = message;
        if (!this.current) this._next();
        await this.player.play(this.current.track);
    };

    public add(track: string, requester: string) {
        return this.next.push({ track, requester });
    };

    public async skip(player: Player) {
        player.stop();
        this._next();
        if (!this.current) return this.emit('finished', 'empty');
        return await player.play(this.current.track);
    };

    public shuffle() {
        for (let i = this.next.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.next[i], this.next[j]] = [this.next[j], this.next[i]];
          }
        return this.next;
    }

    public async remove(song: number) {
        const Number = song - 1;
        this.next = this.next.filter((_, i) => i !== Number);
        return await this.skip(this.player);
    }

    public async skipto(song: number) {
        this.next = this.next.slice(song);
        return await this.skip(this.player);
    }
    
};