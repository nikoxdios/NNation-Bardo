module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        const unverifiedRoleId = '1347369247621517322'; // "Sin Verificar"
        const role = member.guild.roles.cache.get(unverifiedRoleId);
        if (role) {
            try {
                await member.roles.add(role, 'Nuevo usuario sin verificar');
            } catch (err) {
                console.error(`No se pudo asignar el rol "Sin Verificar" a ${member.user.tag}: ${err}`);
            }
        }
    }
};
