'use strict'

const request = require('request-promise')
const crypto = require('crypto')
const randomstring = require('randomstring')
const moment = require('moment')
const md5 = require('md5')
const fs = require('fs')
const parseString = require('xml2js').parseString
const querystring = require('querystring')
const wxMethod = require('../service/weixin')
const wxConfig = require('../../config/config').weixin

/**
 * @api {get} /weixin/pay  微信发红包
 * @apiName weixin pay
 * @apiGroup weixin
 * @apiPermission anyBody
 *
 * @apiDescription pay by weixin.
 *
 * @apiParam {String} url The use url.
 *
 * @apiExample Example usage:
 * http://test.legle.cc/weixin/pay
 *
 * @apiSuccess {String}   appId   'xxx'.
 * @apiSuccess {String}   timestamp 'xxx'.
 * @apiSuccess {nonceStr}   nonceStr 'xxx'.
 * @apiSuccess {signature}   signature 'xxx'.
 *
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *       appId: wxConfig.appId,
 *       timestamp: timestamp,
 *       nonceStr: noncestr,
 *       signature: string1
 *     }
 */
exports.pay = function (openid, money) {
  //调用该接口的地址
  return new Promise(function(resolve, reject) {
    var random_str = randomstring.generate({
      length: 4,
      charset: 'alphanumeric'
    })
    var ORDER_ID = random_str + moment().format('YYYYMMDD') + moment().format('MMDDHHmmss')
    var RANDOM_NUM = randomstring.generate({
      length: 16,
      charset: 'alphanumeric'
    })

    var MCHID = '1482964112'
    var APPID = 'wxe92fab20bfaf18dc'
    var MCHNM = '聆歌科技'
    var peopleNum = 1
    var moneyNum = 100 * money // 单位是分
    // var openid = 'oS_4zxJFOK_CyO-AEiua2L3uVdxU'
    var wishing = '感谢您关注我们的公众号'
    // var wishing = 'goodluck'
    var client_ip = '106.75.64.209'

    var PFX = process.cwd() + '/config/apiclient_cert.p12'
    var url = 'https://api.mch.weixin.qq.com/mmpaymkttransfers/sendredpack'

    var postData = {
        nonce_str: RANDOM_NUM, //随机字符串
        mch_billno: ORDER_ID, //商户订单号,
        mch_id: MCHID, // 商户号,
        wxappid: APPID, // 公众账号appid
        send_name: MCHNM, // 商户名称
        re_openid: openid, // 用户openid  
        total_amount: moneyNum, // 付款金额
        total_num: peopleNum, // 红包发放总人数
        wishing: wishing, //红包祝福语
        client_ip: client_ip, // Ip地址  
        act_name: '关注公众号领取红包', // 活动名称
        remark: 'test' // 备注,
    }
    var sign = getSign(postData)
    postData.sign = sign
    
    var  postXMLData = '<xml>'
        postXMLData += '<act_name>'+postData.act_name+'</act_name>'
        postXMLData += '<client_ip>'+postData.client_ip+'</client_ip>'
        postXMLData += '<mch_billno>'+postData.mch_billno+'</mch_billno>'
        postXMLData += '<mch_id>'+postData.mch_id+'</mch_id>'
        postXMLData += '<nonce_str>'+postData.nonce_str+'</nonce_str>'
        postXMLData += '<re_openid>'+postData.re_openid+'</re_openid>'
        postXMLData += '<remark>'+postData.remark+'</remark>'
        postXMLData += '<send_name>'+postData.send_name+'</send_name>'
        postXMLData += '<total_amount>'+postData.total_amount+'</total_amount>'
        postXMLData += '<total_num>'+postData.total_num+'</total_num>'
        postXMLData += '<wishing>'+postData.wishing+'</wishing>'
        postXMLData += '<wxappid>'+postData.wxappid+'</wxappid>'
        postXMLData += '<sign>'+postData.sign+'</sign>'
        postXMLData += '</xml>'

    request({
      url: url,
      method: 'POST',
      body: postXMLData,
      agentOptions: {
            pfx: fs.readFileSync(PFX),
            passphrase: MCHID
      }
    }, function(err, response, body) {
        parseString(body, function(err, result) {
            resolve(result)
        })
    })
  })
}

// 获取签名
function getSign(obj) {
    // console.log('元素obj:')
    // console.log(obj)
    var parmsString = querystring.stringify(obj)
    var stringAArr = parmsString.split('&')

    stringAArr[4] = 'send_name=聆歌科技'
    stringAArr[8] = 'wishing=感谢您关注我们的公众号'
    stringAArr[10] = 'act_name=关注公众号领取红包'


    var stringA = stringAArr.sort().join('&')
    // console.log('第一步:' + stringA)

    // 以上是按ASCII排序

    var stringSignTemp = stringA + '&key=' + 'Ling123Ge888LegLe321Ge888Le66688'
    // console.log('第二步：'+stringSignTemp)

    // stringSignTemp = (stringSignTemp)
    var sign = md5(stringSignTemp).toUpperCase()

    // console.log('第四步：'+sign)
    return sign
}


exports.taianPay = function (openid, money) {
  //调用该接口的地址
  var random_str = randomstring.generate({
    length: 4,
    charset: 'alphanumeric'
  })
  var ORDER_ID = random_str + moment().format('YYYYMMDD') + moment().format('MMDDHHmmss')
  var RANDOM_NUM = randomstring.generate({
    length: 16,
    charset: 'alphanumeric'
  })

  var MCHID = '1262605501'
  var APPID = 'wx548e774e59da71ed'
  var MCHNM = '泰安韩美整形美容'
  var peopleNum = 1
  var moneyNum = 100 * money // 单位是分
  // var openid = 'oS_4zxJFOK_CyO-AEiua2L3uVdxU'
  var wishing = '感谢您参与七夕分享活动，恭喜你获得红包'
  // var wishing = 'goodluck'
  var client_ip = '39.108.50.172'

  var PFX = process.cwd() + '/config/taian_cert.p12'
  var url = 'https://api.mch.weixin.qq.com/mmpaymkttransfers/sendredpack'

  var postData = {
      nonce_str: RANDOM_NUM, //随机字符串
      mch_billno: ORDER_ID, //商户订单号,
      mch_id: MCHID, // 商户号,
      wxappid: APPID, // 公众账号appid
      send_name: MCHNM, // 商户名称
      re_openid: openid, // 用户openid  
      total_amount: moneyNum, // 付款金额
      total_num: peopleNum, // 红包发放总人数
      wishing: wishing, //红包祝福语
      client_ip: client_ip, // Ip地址  
      act_name: '七夕分享拿红包活动', // 活动名称
      remark: 'test' // 备注,
  }
  var sign = tananSign(postData)
  postData.sign = sign
  
  var  postXMLData = '<xml>'
      postXMLData += '<act_name>'+postData.act_name+'</act_name>'
      postXMLData += '<client_ip>'+postData.client_ip+'</client_ip>'
      postXMLData += '<mch_billno>'+postData.mch_billno+'</mch_billno>'
      postXMLData += '<mch_id>'+postData.mch_id+'</mch_id>'
      postXMLData += '<nonce_str>'+postData.nonce_str+'</nonce_str>'
      postXMLData += '<re_openid>'+postData.re_openid+'</re_openid>'
      postXMLData += '<remark>'+postData.remark+'</remark>'
      postXMLData += '<send_name>'+postData.send_name+'</send_name>'
      postXMLData += '<total_amount>'+postData.total_amount+'</total_amount>'
      postXMLData += '<total_num>'+postData.total_num+'</total_num>'
      postXMLData += '<wishing>'+postData.wishing+'</wishing>'
      postXMLData += '<wxappid>'+postData.wxappid+'</wxappid>'
      postXMLData += '<sign>'+postData.sign+'</sign>'
      postXMLData += '</xml>'

  request({
    url: url,
    method: 'POST',
    body: postXMLData,
    agentOptions: {
          pfx: fs.readFileSync(PFX),
          passphrase: MCHID
    }
  }, function(err, response, body) {
      console.log(body)
      parseString(body, function(err, result) {
          var result = {
              code: 200,
              data: result.xml,
              message: 'success'
          }
          // callback(null, result)
      })
      
  })
}

// 获取签名
function tananSign(obj) {
    // console.log('元素obj:')
    // console.log(obj)
    var parmsString = querystring.stringify(obj)
    var stringAArr = parmsString.split('&')

    stringAArr[4] = 'send_name=泰安韩美整形美容'
    stringAArr[8] = 'wishing=感谢您参与七夕分享活动，恭喜你获得红包'
    stringAArr[10] = 'act_name=七夕分享拿红包活动'


    var stringA = stringAArr.sort().join('&')
    // console.log('第一步:' + stringA)

    // 以上是按ASCII排序

    var stringSignTemp = stringA + '&key=' + 'taianhanmeizhengxing05386789888a'
    // console.log('第二步：'+stringSignTemp)

    // stringSignTemp = (stringSignTemp)
    var sign = md5(stringSignTemp).toUpperCase()

    // console.log('第四步：'+sign)
    return sign
}



/**
 * @api {get} /weixin/share  获取微信认证信息
 * @apiName weixin share
 * @apiGroup weixin
 * @apiPermission anyBody
 *
 * @apiDescription share by weixin.
 *
 * @apiParam {String} url The use url.
 *
 * @apiExample Example usage:
 * http://test.legle.cc/weixin/share
 *
 * @apiSuccess {String}   appId   'xxx'.
 * @apiSuccess {String}   timestamp 'xxx'.
 * @apiSuccess {nonceStr}   nonceStr 'xxx'.
 * @apiSuccess {signature}   signature 'xxx'.
 *
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *       appId: wxConfig.appId,
 *       timestamp: timestamp,
 *       nonceStr: noncestr,
 *       signature: string1
 *     }
 */
exports.share = function *(next) {
  //调用该接口的地址
  let url1 = this.request.body.url
  let now = parseInt(new Date().getTime() / 1000)

  if (wxConfig.expire == null || wxConfig.access_token == null || now > wxConfig.expire) {
    let data = yield request.get('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + wxConfig.appId + '&secret=' + wxConfig.secret)
    data = JSON.parse(data)


    wxConfig.access_token = data.access_token
    wxConfig.expire = parseInt(now)+3600

    let url = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + data.access_token + '&type=jsapi'

    let wxData = yield request.get(url)
    wxData = JSON.parse(wxData)

    let noncestr = wxMethod.getNonceStr()
    let timestamp = wxMethod.getTimeStamp()

    let string1 = 'jsapi_ticket=' + wxData.ticket + '&noncestr=' + noncestr + '&timestamp=' + timestamp + '&url=' + url1

    let md5sum = crypto.createHash('sha1')
    md5sum.update(string1)
    string1 = md5sum.digest('hex')

    // console('JSSDK签名:' + string1)

    this.body = {
        //debug: true,
        appId: wxConfig.appId,
        timestamp: timestamp,
        nonceStr: noncestr,
        signature: string1
    }

  }else{
    let url = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + wxConfig.access_token + '&type=jsapi'

    let data = yield request.get(url)
    data = JSON.parse(data)

    let noncestr = wxMethod.getNonceStr()
    let timestamp = wxMethod.getTimeStamp()

    let string1 = 'jsapi_ticket=' + data.ticket + '&noncestr=' + noncestr + '&timestamp=' + timestamp + '&url=' + url1

    let md5sum = crypto.createHash('sha1')
    md5sum.update(string1)
    string1 = md5sum.digest('hex')


    this.body = {
      //debug: true,
      appId: wxConfig.appId,
      timestamp: timestamp,
      nonceStr: noncestr,
      signature: string1
    }
  }
}


//  泰安share
exports.taianShare = function *(next) {
  //调用该接口的地址
  let url1 = this.request.body.url
  let now = parseInt(new Date().getTime() / 1000)

  let taianConfig = require('../../config/config').taian

  if (taianConfig.expire == null || taianConfig.access_token == null || now > taianConfig.expire) {
    let data = yield request.get('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + taianConfig.appID + '&secret=' + taianConfig.appSecret)
    data = JSON.parse(data)


    taianConfig.access_token = data.access_token
    taianConfig.expire = parseInt(now)+3600

    let url = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + data.access_token + '&type=jsapi'

    let wxData = yield request.get(url)
    wxData = JSON.parse(wxData)

    let noncestr = wxMethod.getNonceStr()
    let timestamp = wxMethod.getTimeStamp()

    let string1 = 'jsapi_ticket=' + wxData.ticket + '&noncestr=' + noncestr + '&timestamp=' + timestamp + '&url=' + url1

    let md5sum = crypto.createHash('sha1')
    md5sum.update(string1)
    string1 = md5sum.digest('hex')

    // console('JSSDK签名:' + string1)

    this.body = {
        //debug: true,
        appId: taianConfig.appID,
        timestamp: timestamp,
        nonceStr: noncestr,
        signature: string1
    }

  }else{
    let url = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + taianConfig.access_token + '&type=jsapi'

    let data = yield request.get(url)
    data = JSON.parse(data)

    let noncestr = wxMethod.getNonceStr()
    let timestamp = wxMethod.getTimeStamp()

    let string1 = 'jsapi_ticket=' + data.ticket + '&noncestr=' + noncestr + '&timestamp=' + timestamp + '&url=' + url1

    let md5sum = crypto.createHash('sha1')
    md5sum.update(string1)
    string1 = md5sum.digest('hex')


    this.body = {
      //debug: true,
      appId: taianConfig.appID,
      timestamp: timestamp,
      nonceStr: noncestr,
      signature: string1
    }
  }
}

exports.creatMenu = function *(next) {
  let data = yield request.get('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + wxConfig.appId + '&secret=' + wxConfig.secret)
    data = JSON.parse(data)

  let url = 'https://api.weixin.qq.com/cgi-bin/menu/create?access_token=' + data.access_token
  let menu = {
    "button":[
      {    
          "type":"view",
          "name":"我的优惠券",
          "key":"V1001_TODAY_MUSIC",
          "url":"http://azz.leglear.com/azz/html/coupon.html"
      }
    ]
  }
  let _data = yield request({url:url,method:'POST',body:menu,json:true})
  this.body = {
    ret: 1,
    data: _data
  }   
}

exports.material = function *(next) {
  let data = yield request.get('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + wxConfig.appId + '&secret=' + wxConfig.secret)
    data = JSON.parse(data)

  let url = 'https://api.weixin.qq.com/cgi-bin/material/batchget\_material?access\_token=' + data.access_token
  let menu = {
    type:'news',
    offset:0,
    count:5
  }
  let _data = yield request({url:url,method:'POST',body:menu,json:true})
  this.body = {
    ret: 1,
    data: _data
  }   
}


