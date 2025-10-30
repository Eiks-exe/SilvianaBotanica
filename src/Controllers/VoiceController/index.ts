import { Guild, GuildChannelCreateOptions, ChannelType } from "discord.js";
import { getDB } from "../../utils/database";


export const createHostVc = async (guild: Guild, options : GuildChannelCreateOptions, category?: string) => {
  const db = getDB();
  
  const hostVoiceChannel = await guild.channels.create({
    ...options,
    type : ChannelType.GuildVoice
  });
  const parentCategory = category ? await createTableCategory(guild, category) : null;
  const parentCategoryId = parentCategory?.id; 

  db.run(
    `INSERT INTO host_channels (guild_id, channel_id, channel_name, owner_id, parent_category_id) VALUES (?, ?, ?, ?,?)`,
    guild.id,
    hostVoiceChannel.id,
    hostVoiceChannel.name,
    guild.ownerId,
    parentCategoryId
  );
  console.log("hvc", hostVoiceChannel.type)
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
  const categoryId = await db.get<{parent_category_id: string}>(`SELECT parent_category_id FROM host_channels WHERE guild_id = ? LIMIT 1`, guildId);
  return categoryId?.parent_category_id 
}

export const resetGuildHost = async (guildId: string) => {
  const db = getDB();
  const result = await db.run(`DELETE FROM host_channels WHERE guild_id = ?`, guildId)
  console.log(`deleted ${result.changes} row for guild ${guildId}`)
  return result.changes; 
}
