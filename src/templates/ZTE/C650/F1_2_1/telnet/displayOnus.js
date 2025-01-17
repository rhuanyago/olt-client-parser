const { connect } = require('../../../../../config/telnet-connect')
const { column2json, hour2time, str2mac } = require('../../../../../utils/lib')

/*
ZXAN#show gpon onu detail-info gpon-onu_1/12/1:1

ONU interface:          gpon_onu-1/1/1:1
  Name:                 ********
  Splitter:             
  Type:                 630-10B
  Configured speed mode:auto
  Current speed mode:   GPON
  Admin state:          enable
  Phase state:          DyingGasp
  Config state:         fail
  Authentication mode:  sn
  SN Bind:              enable with SN check
  Serial number:        FRKW2782DDD6
  Password:             
  Description:          ********
  Vport mode:           gemport
  DBA Mode:             Hybrid
  ONU Status:           enable
  OMCI BW Profile:      704kbps
  OMCC Encrypt:         disable
  Line Profile:         N/A
  Service Profile:      N/A
  ONU Distance:         1900m
  Online Duration:      0h 0m 0s
  FEC:                  disable
  FEC actual mode:      disable
  1PPS+ToD:             disable
  Auto replace:         disable 
  Multicast encryption: disable
  Multicast encryption current state:N/A
------------------------------------------
       Authpass Time          OfflineTime             Cause
   1   2022-12-22 23:53:29    2022-12-25 13:19:56     LOSi     
   2   2022-12-25 13:20:40    2022-12-25 13:30:21     LOSi     
   3   2022-12-25 13:31:07    2022-12-27 17:14:39     DyingGasp 
   4   2022-12-27 17:54:32    2022-12-28 07:37:40     DyingGasp 
   5   2022-12-28 08:12:33    2023-01-07 07:57:42     DyingGasp 
   6   2023-01-07 07:58:35    2023-01-19 22:07:53     DyingGasp 
   7   2023-01-19 22:08:50    2023-01-30 18:32:13     LOSi     
   8   2023-01-30 18:37:32    2023-01-30 18:38:39     DyingGasp 
   9   2023-01-30 18:39:34    2023-02-26 06:04:58     DyingGasp 
  10   2023-02-26 06:06:03    2023-03-08 20:12:31     DyingGasp 
*/


const STATUS = {
  'working': 'online',
  'LOS': 'los',
  'DyingGasp': 'pwr_fail',
}

const displayOnus = async (options, { 
  board = '1', 
  slot = '1', 
  port = '1',
  authorization_at = new Date(),
}) => {
  // const conn = await connect(options)
  const f_p_s = `${board}/${slot}/${port}`
  const cmd = `show gpon onu detail-info gpon_onu-${f_p_s}`  
  const chunk = `ONU interface:          gpon_onu-1/1/1:1
  Name:                 ********
  Splitter:             
  Type:                 630-10B
  Configured speed mode:auto
  Current speed mode:   GPON
  Admin state:          enable
  Phase state:          DyingGasp
  Config state:         fail
  Authentication mode:  sn
  SN Bind:              enable with SN check
  Serial number:        FRKW2782DDD6
  Password:             
  Description:          ********
  Vport mode:           gemport
  DBA Mode:             Hybrid
  ONU Status:           enable
  OMCI BW Profile:      704kbps
  OMCC Encrypt:         disable
  Line Profile:         N/A
  Service Profile:      N/A
  ONU Distance:         1900m
  Online Duration:      0h 0m 0s
  FEC:                  disable
  FEC actual mode:      disable
  1PPS+ToD:             disable
  Auto replace:         disable 
  Multicast encryption: disable
  Multicast encryption current state:N/A
------------------------------------------
       Authpass Time          OfflineTime             Cause
   1   2022-12-22 23:53:29    2022-12-25 13:19:56     LOSi     
   2   2022-12-25 13:20:40    2022-12-25 13:30:21     LOSi     
   3   2022-12-25 13:31:07    2022-12-27 17:14:39     DyingGasp 
   4   2022-12-27 17:54:32    2022-12-28 07:37:40     DyingGasp 
   5   2022-12-28 08:12:33    2023-01-07 07:57:42     DyingGasp 
   6   2023-01-07 07:58:35    2023-01-19 22:07:53     DyingGasp 
   7   2023-01-19 22:08:50    2023-01-30 18:32:13     LOSi     
   8   2023-01-30 18:37:32    2023-01-30 18:38:39     DyingGasp 
   9   2023-01-30 18:39:34    2023-02-26 06:04:58     DyingGasp 
  10   2023-02-26 06:06:03    2023-03-08 20:12:31     DyingGasp`;

  const { size: length = 128 } = options && options.__extra__ && options.__extra__.onu || {}
  
  const data = []
  for await (const [index] of Array.from({ length }).entries()) {
    const ont_id = index + 1
    /*
    // const chunk = await conn.exec(`${cmd}:${ont_id}`)
    */
    const [chunkData] = chunk.split('------------------------------------------')
    const item = column2json(
      chunkData
      .split('\n')
      .map(item2 => 
        item2
          .replace(':', '[$%]')
          .replace(/\:/gi, '-')
          .replace('[$%]', ':')
        )
      .splice(1))

    /*
    // const chunkMA = await conn.exec(`show mac interface vport-1${f_p_s}.${ont_id}:1`)
    */
    const chunckMA = `Total mac address : 1
Mac address      Vlan  Type      Port                     Vc                      
              
-------------------------------------------------------------------------------
c83a.3529.9ea0   2501   Dynamic   vport-1/1/1.2:1                  `

    const columns = [
      [0, 17],
      [17, 23],
      [23, 33],
      [33, 58],
    ]
    const [_line1, _line2, _line3, _line4, ...splitted] = chunckMA.split('\n')
    const element = (splitted[0] || '').substring(0, 17).trim()

    /*
    // const chunkMA = await conn.exec(`show pon power attenuation gpon_onu-${f_p_s}${ont_id}`)
    */
    const chunckSignal = `           OLT                  ONU              Attenuation
--------------------------------------------------------------------------
 up      Rx :-20.980(dbm)      Tx:2.359(dbm)        23.339(dB)

 down    Tx :6.819(dbm)        Rx:-17.560(dbm)      24.379(dB)`

    const [_header1, _header2, upSignal, _header3, downSignal] = chunckSignal.split('\n')
    
    const tx_power = downSignal.trim().substring(12, 27);
    const rx_power = downSignal.trim().substring(33, 47);
    const olt_rx_power = upSignal.trim().substring(12, 27);

    const authorization_at_final = authorization_at || new Date()

    data.push({
      board,
      slot,
      port,
      ont_id,
      // pon_type: 'gpon',
      // capability: 'bridging_routing',
      // allow_custom_profiles: false,
      // catv: false,
      temperature: 0,
      tx_power: parseFloat((tx_power || '').toLowerCase().replace('dbm', '').trim().replace(/ /gi, ''), 10),
      olt_rx_power: parseFloat((olt_rx_power || '').toLowerCase().replace('dbm', '').trim().replace(/ /gi, ''), 10),
      catv_rx_power: 0,
      onu_type: item.type,
      name: item.name,
      rx_power: parseFloat((rx_power || '').toLowerCase().replace('dbm', '').trim().replace(/ /gi, ''), 10),
      onu_external_id: item.serialnumber,
      serial_number: item.serialnumber,
      mac_address: str2mac(element.replace(/\./gi, '')).replace(/\-/gi, ':'),
      description: item.description,
      distance: parseInt((item.o_n_u_distance || '').replace('m', ''), 10),
      stage: STATUS[item.phasestate] || 'disabled',
      authorization_at: authorization_at_final,
      uptime_at: hour2time(item.online_duration),
      custom_fields: {
        source: 'import_onu',
      }
    })
  }
      
  return data
}

module.exports = displayOnus