const { connect } = require('../../../../config/ssh-connect')
const { dummy2json } = require('../../../../utils/lib')

/*
  ----------------------------------------------------------------------------
  Profile-ID   type   Bandwidth      Fix        Assure        Max        Bind
                     compensation    (kbps)     (kbps)        (kbps)     times
  ----------------------------------------------------------------------------
           0      3           No          0       8192         20480         1
           1      1           No       5120          0             0         3
           2      1           No       1024          0             0         0
           3      4           No          0          0         32768         0
           4      1           No    1024000          0             0         0
           5      1           No      32768          0             0         0
           6      1           No     102400          0             0         0
           7      2           No          0      32768             0         0
           8      2           No          0     102400             0         0
           9      3           No          0      32768         65536         0
          10      4           No          0          0        499968         1
  ----------------------------------------------------------------------------
*/

const displayDbaProfiles = async (options) => {
  const conn = await connect(options)
  const cmd = `enable
display dba-profile all`
  const chunk = await conn.exec7(cmd)
  if (!chunk && chunk === '') return null
  const splitted = chunk.split('\r\n')
 
  splitted.shift()
  splitted.shift()
  splitted.shift()
	splitted.shift()
	splitted.shift()
	splitted.shift()
	splitted.pop()

	const columns = [
    [0, 15],
    [15, 21],
    [21, 36],
    [36, 47],
    [47, 60],
    [60, 72],
    [72, 79],
  ]
  
  const data = dummy2json(splitted.join('\n'), columns, 2)

  return data.map((item) => ({
    name: item['profile-_i_d'], 
    type: item.type,
    fixed: item['fix_(kbps)'],
    assured: item['assure_(kbps)'],
    speed: item['max_(kbps)'],
    custom_fields: {
      ...item,
    }
  }))
  
}

module.exports = displayDbaProfiles