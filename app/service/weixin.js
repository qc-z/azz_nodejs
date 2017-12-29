'use strict'

const JsSHA = require('jssha')


const service = {
  getNonceStr: function () {
    return Math.random().toString(36).substr(2, 15)
  },
  getIp: function (req) {
    var ip = req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress
    return ip.replace('::ffff:', '')
  },
  getTimeStamp: function () {
    var timestamp = new Date()
    return timestamp.getTime().toString()
  },
  verify: function(query) {
    let token     = 'Ling123Ge888LegLe321Ge888Le6666'
    let signature = query.signature
    let timestamp = query.timestamp
    let echostr   = query.echostr
    let nonce     = query.nonce
    let oriArray = new Array()
    oriArray[0] = nonce
    oriArray[1] = timestamp
    oriArray[2] = token
    oriArray.sort()
    let original = oriArray.join('')
    let shaObj = new JsSHA('SHA-1', 'TEXT')
    shaObj.update(original)
    let scyptoString=shaObj.getHash('HEX')

    if(signature == scyptoString) {
       return true
    } else {
      return false
    }
  }
}

module.exports = service