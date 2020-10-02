import BaseEvent from '../../../utils/structures/BaseEvent';
import DiscordClient from '../../../client/client';

export default class ReadyEvent extends BaseEvent {
  constructor() {
    super('ready');
  }
  async run (client: DiscordClient) {
    let activities = ['with the re-written code', 'the new Beta 5 soon™', 'Listening to Daan about the new update', 'Waiting for beta 5 launch', 'with the new music system 👀'], i =0;
    setInterval(() => client.user.setActivity(activities[i++ % activities.length], { type: 'PLAYING' }), 15000);
    
    await client.user.setStatus('dnd');
    client.music.init(client.user.id);

    console.log(`${client.user.tag} has logged in!`);
  }
}