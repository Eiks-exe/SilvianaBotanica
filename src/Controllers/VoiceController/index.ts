import { Guild, GuildChannelCreateOptions, ChannelType } from "discord.js";
import { getDB } from "../../utils/database";


export const createHostVc = async (guild: Guild, options : GuildChannelCreateOptions, category?: string) => {
  const db = getDB();
  const hostVoiceChannel = await guild.channels.create(options);
  const parentCategory = category ? await createTableCategory(guild, category) : undefined;

  db.run(
    `INSERT INTO host_channels (guild_id, channel_id, channel_name, owner_id, parent_category_id) VALUES (?, ?, ?, ?)`,
    guild.id,
    hostVoiceChannel.id,
    hostVoiceChannel.name,
    guild.ownerId,
    parentCategory ? parentCategory.id : null
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

export const createTableCategory = async (guild: Guild, name = "table") => {
  const db = getDB();
  const category = await guild.channels.create({
    type: ChannelType.GuildCategory,
    name: name, 
  })
  await db.run(`UPDATE host_channels SET parent_category_id = ? WHERE guild_id = ?`, 
    [category.id, guild.id],
    (err: Error) => {
      if (err) {
        console.error("failed to update parent_category_id:", err)
      } else {
        console.log(`Updated ${this}`)
      }
    }
  ) 
  return category
}

export const getTableCategoryId_byGuildId = async (guildId: string) => {
  const db = getDB();
  const categoryId = await db.get<string>(`SELECT parent_category_id FROM host_channels WHERE guild_id = ? LIMIT 1`, guildId);
  return categoryId 
}
