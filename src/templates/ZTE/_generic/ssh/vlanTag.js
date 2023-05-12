const { connect } = require('../../../../config/ssh-connect')

const createVlan = async (options, { vlan, interface }) => {
  const conn = await connect(options)
  const cmd = `conf t 
interface ${interface}
switchport vlan ${vlan} tag`
  await conn.exec2(cmd)

  return cmd
}

module.exports = createVlan
