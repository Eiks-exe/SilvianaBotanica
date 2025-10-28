import { ActionRowBuilder, ButtonInteraction, ChannelType, ModalBuilder, TextInputBuilder, UserSelectMenuBuilder, UserSelectMenuInteraction, StringSelectMenuBuilder, SelectMenuBuilder, VoiceChannel, StringSelectMenuInteraction } from "discord.js";

export const handleInviteGuestInteraction = async (interaction: ButtonInteraction) => {
  const selectMenu = new UserSelectMenuBuilder()
    .setCustomId('select_guest')
    .setPlaceholder('Select guest to invite')
    .setMinValues(1)
.setMaxValues(5)
  
  const selectMenuRow = new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(selectMenu);
  
  await interaction.reply({
    content: '👥 Choose who you’d like to invite to your table:',
    components: [selectMenuRow],
    ephemeral: true,
  })
}

export const inviteGuestMenuInteraction = async (interaction: UserSelectMenuInteraction) => {
  const selectedUsers = interaction.values;
  const voiceChannel = interaction.channel
  
  if(voiceChannel?.type !== ChannelType.GuildVoice) return;
  
  const invite = await voiceChannel.createInvite({
    maxAge: 3600, // 1 hour
    maxUses: 5,
    unique: true,
    reason: `${interaction.user.username} reserved a table.`,
  });
  for (const id of selectedUsers) {
    const member = await interaction.guild?.members.fetch(id);
    if (member && voiceChannel) {
      console.log(member)
      voiceChannel.permissionOverwrites.edit(member, {
        Connect: true,
        ViewChannel: true, 
      })
      member.send(`you've been invited to ${voiceChannel.name}: \n ${invite}`)
    }
  }

  await interaction.reply({
    content: `✅ Invited ${selectedUsers.length} guest(s) to your table.`,
    ephemeral: true
  })
}

export const tableSettingsInteraction = async (interaction: ButtonInteraction) => {
  const settingsUserLimit = new StringSelectMenuBuilder()
    .setCustomId('user_limit_select')
    .setPlaceholder('number of seat')
    .addOptions([
      {
        label: "2",
        value:"2"
      },
      {
        label: "4",
        value: "4"
      },
      {
        label: "6",
        value: "6"
      }
    ])
    .setMinValues(0)
    .setMaxValues(1)

    
  const settingsActionRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(settingsUserLimit);
  
  
  await interaction.reply({
    content: 'would you like to adjust your seats ?',
    components: [settingsActionRow], 
    ephemeral: true
  });

}

export const setPrivacyInteraction = (interaction: ButtonInteraction) => {

  const select = new StringSelectMenuBuilder()
    .setCustomId("privacy_settings")
    .setPlaceholder("visibility")
    .addOptions([
      {
        label: "Private table",
        description: "Only invited guest can see and/or join your table",
        value: "private",
      },
      {
        label: "Public table",
        description: "Anyone can see and/or join your table",
        value: "public",
      }
    ])
    .setMinValues(0)
    .setMaxValues(1)
  
  const privacyRow = new ActionRowBuilder<SelectMenuBuilder>().addComponents(select);
  interaction.reply({
    content: "set your table accessibility",
    components: [privacyRow],
    ephemeral: true
  })
}


export const setUserLimit = (interaction : StringSelectMenuInteraction) => {
  const voiceChannel = interaction.channel
  if(voiceChannel?.type !== ChannelType.GuildVoice) return;
  console.log(parseInt(interaction.values[0]))
  voiceChannel.setUserLimit(parseInt(interaction.values[0]))
  interaction.reply({
    content:`you table as know ${interaction.values[0]}`,
    ephemeral: true
  })
}

export const setTablePrivacy = (interaction:StringSelectMenuInteraction) =>{
  const voiceChannel = interaction.channel
  const privacyValue = interaction.values[0]

  if(voiceChannel?.type !== ChannelType.GuildVoice) return;
  const makePrivate = (interaction: StringSelectMenuInteraction) => {
    voiceChannel.permissionOverwrites.edit(voiceChannel.guild.roles.everyone, {
      Connect: false,
      ViewChannel: false
    }) 
    interaction.reply("your table is now private")
  }

  const makePublic = (interaction: StringSelectMenuInteraction) => {
      voiceChannel.permissionOverwrites.edit(voiceChannel.guild.roles.everyone, {
        Connect: true,
        ViewChannel: true
      })
      interaction.reply("your table is now public")
  }
  switch (privacyValue) {
    case 'private':
      return makePrivate(interaction)
    case 'public':
      return makePublic(interaction)
  } 
}

export const closeTableInteraction = (interaction: ButtonInteraction) => {
  const voiceChannel = interaction.channel

  if (voiceChannel?.type !== ChannelType.GuildVoice) return;
  voiceChannel.delete()
}
