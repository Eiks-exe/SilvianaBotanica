import { Guild, GuildChannelCreateOptions } from "discord.js";
import { getDB } from "../../utils/database";


export const createHostVc = async (guild: Guild, options : GuildChannelCreateOptions) => {
  const db = getDB();
  const hostVoiceChannel = await guild.channels.create(options);

  db.run(
    `INSERT INTO host_channels (guild_id, channel_id, channel_name, owner_id) VALUES (?, ?, ?, ?)`,
    guild.id,
    hostVoiceChannel.id,
    hostVoiceChannel.name,
    guild.ownerId
  );

  return hostVoiceChannel;
}

interface IhostVc {
  guild_id: string,
  channel_id: string,
  channel_name:string,
  owner_id:string
}
export const getHostChannelForGuild = async (guildId : string): Promise< IhostVc | null > => {
  const db = getDB();
  const host = await db.get<IhostVc>('SELECT * FROM host_channels WHERE guild_id = ? LIMIT 1', guildId);
  return host ? host : null ; 
}
