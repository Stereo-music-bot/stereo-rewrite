import { Client, ClientOptions, Collection, } from 'discord.js';
import BaseEvent from '../utils/structures/BaseEvent';
import BaseCommand from '../utils/structures/BaseCommand';
import { EmojiFinder } from '../utils/functions/emojiFinder'
import { Manager } from 'lavaclient';

export default class DiscordClient extends Client {

  private _commands = new Collection<string, BaseCommand>();
  private _cs = new Collection<string, BaseCommand>();
  private _events = new Collection<string, BaseEvent>();
  private _prefix: string = '!';
  public music: Manager;

  constructor(options?: ClientOptions) {
    super(options);
  }

  get commands(): Collection<string, BaseCommand> { return this._commands; }
  get cs(): Collection<string, BaseCommand> { return this._cs; }
  get events(): Collection<string, BaseEvent> { return this._events; }
  get prefix(): string { return this._prefix; }

  set prefix(prefix: string) { this._prefix = prefix; }

}
