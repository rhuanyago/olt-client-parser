const { connect } = require('../../../../../config/ssh-connect')

const generateCommmand = (type, f_p_s, ont_id) => `show pon power attenuation ${type}-onu_${f_p_s}:${ont_id}`

const runCommand = (chunckSignal) => {
  let tx_power = 0
  let rx_power = 0
  let olt_rx_power = 0
  if (chunckSignal && chunckSignal !== '') {
    const [_header0, _header1, _header2, _header3, upSignal, _header4, downSignal] = chunckSignal.split('\r\n')
    
    if (downSignal) {
      tx_power = downSignal.trim().substring(12, 27)
      rx_power = downSignal.trim().substring(33, 47)
    }
    if (upSignal) olt_rx_power = upSignal.trim().substring(12, 27)
  }

  return {
    tx_power: parseFloat((tx_power || '0').toLowerCase().replace('dbm', '').trim().replace(/ /gi, ''), 10),
    olt_rx_power: parseFloat((olt_rx_power || '0').toLowerCase().replace('dbm', '').trim().replace(/ /gi, ''), 10),
    rx_power: parseFloat((rx_power || '0').toLowerCase().replace('dbm', '').trim().replace(/ /gi, ''), 10),
    catv_rx_power: 0,
  } 
}

const displaySignal = async (options, { 
  pon_type: type = 'gpon', 
  board = '1', 
  slot = '1', 
  port = '1',
  ont_id = '1' 
}) => {
  const f_p_s = `${board}/${slot}/${port}` 
  const conn = await connect(options)
  const cmd = generateCommmand(type, f_p_s, ont_id)
  const chunckSignal = await conn.exec2(cmd)
  return runCommand(chunckSignal)       
}

module.exports = { 
  generateCommmand,
  runCommand,
  displaySignal, 
}