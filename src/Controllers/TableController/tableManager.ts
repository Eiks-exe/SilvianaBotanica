import { ActionRowBuilder, ButtonInteraction, ChannelType, UserSelectMenuBuilder, UserSelectMenuInteraction } from "discord.js";

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
  console.log("selectmenuinteraction") 
  for (const id of selectedUsers) {
    const member = await interaction.guild?.members.fetch(id);
    if (member && voiceChannel) {
      console.log(member)
      if(voiceChannel.type !== ChannelType.GuildVoice) return;
      voiceChannel.permissionOverwrites.edit(member, {
        Connect: true,
        ViewChannel: true, 
      })
      member.send(`you've been invited to ${voiceChannel.name}`)
    }
  }

  await interaction.reply({
    content: `✅ Invited ${selectedUsers.length} guest(s) to your table.`,
    ephemeral: true
  })
}
