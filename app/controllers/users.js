'use strict'

const mongoose = require('mongoose')
const Face = mongoose.model('Face')
const User = mongoose.model('User')
const Eyebrow = mongoose.model('Eyebrow')
const StarTest = mongoose.model('Startest')
const Stars = mongoose.model('Star')
const Redpack = mongoose.model('Redpack')
const Game = mongoose.model('Game')
const sms = require('../service/sms')
const weixin = require('../service/weixin')
const aliyun = require('../service/aliyun')
const weixinC = require('./weixin')
const Msg = require('../libs/msg')
const JsSHA = require('jssha')
const config = require('../../config/config')


exports.index = function *(next) {

  // const stars = yield Stars.find().exec()
  // let aa = 0
  // for (let i = 0; i < stars.length; i++) {
  //   if(stars[i] || stars[i].picture && stars[i].picture.indexOf('images/star/') > -1) {
  //     stars[i].picture = stars[i].picture.replace('120.132.68.45:3004/public/images/star', 'azz-test.oss-cn-shenzhen.aliyuncs.com/stars')
  //     yield stars[i].save()
  //     aa++
  //     console.log(aa)
  //   }
  // }

  // let hongbao = yield weixinC.pay('oS_4zxJFOK_CyO-AEiua2L3uVdxU', 1)

  // this.body = hongbao.xml.result_code[0]
  this.body = 'ok'

}


exports.test = function *(next) {

  console.log(this.request.body)

  this.body = {
    ret: 0,
    err: this.request.body
  }
}

exports.azz = function *(next) {
  let token= 'Ling123Ge888LegLe321Ge888Le6666'
  let signature = this.query.signature
  let timestamp = this.query.timestamp
  let echostr   = this.query.echostr
  let nonce     = this.query.nonce
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
     console.log('成功')
  } else {
    console.log('失败')
  }


  console.log(this.query)
  this.body = echostr
}


// 接收微信推送通知
exports.azzP = function *(next) {

  let verify = weixin.verify(this.query)
  let openid = this.query.openid || ''
  let appid = 'gh_f99d1df25c52'
  let time = new Date().getTime()
  this.type = 'application/xml'


  if(verify && openid && this.request.body.xml) {
    console.log(this.request.body)
    let xml = this.request.body.xml
    if(xml.Event && xml.Event[0] == 'subscribe') {
      let subXml = `<xml>
                <ToUserName><![CDATA[${openid}]]></ToUserName>
                <FromUserName><![CDATA[${appid}]]></FromUserName>
                <CreateTime>${time}</CreateTime>
                <MsgType><![CDATA[text]]></MsgType>
                <Content><![CDATA[输入手机号码领取红包]]></Content>
              </xml>`

      return (this.body = subXml)
    }

    if(xml.MsgType && xml.MsgType[0] == 'text') {
      let mobile = xml.Content[0]
      if(mobile.length == 4) {
        let code = mobile
        let exist = yield Game.findOne({openid: openid, code: code, done: 'yes', category: 'coupon'}).exec()
        if(exist) {
          let redbXml = `<xml>
                  <ToUserName><![CDATA[${openid}]]></ToUserName>
                  <FromUserName><![CDATA[${appid}]]></FromUserName>
                  <CreateTime>${time}</CreateTime>
                  <MsgType><![CDATA[news]]></MsgType>
                  <ArticleCount>1</ArticleCount>
                    <Articles>
                      <item>
                        <Title><![CDATA[我的优惠券]]></Title>
                        <Description><![CDATA[点击查看优惠券详情]]></Description>
                        <PicUrl><![CDATA[http://azz-photo.oss-cn-shenzhen.aliyuncs.com/other/coupon.jpg]]></PicUrl>
                        <Url><![CDATA[${config.SITE_ROOT_URL}/azz/html/coupon.html?openid=${openid}]]></Url>
                      </item>
                    </Articles>
                </xml>`
            return (this.body = redbXml)
        }
        else if(!exist) {
          // sendredpack
          let presend = yield Game.findOne({code: code, done: 'no', category: 'coupon'}).exec()
          if(!presend) {
            let redbXml = `<xml>
                  <ToUserName><![CDATA[${openid}]]></ToUserName>
                  <FromUserName><![CDATA[${appid}]]></FromUserName>
                  <CreateTime>${time}</CreateTime>
                  <MsgType><![CDATA[text]]></MsgType>
                  <Content><![CDATA[请先参与美甲机砸金蛋活动]]></Content>
                </xml>`

            return (this.body = redbXml)
          }
          else { 
            presend.openid = openid
            presend.done = 'yes'
            yield presend.save()
            let redbXml = `<xml>
                  <ToUserName><![CDATA[${openid}]]></ToUserName>
                  <FromUserName><![CDATA[${appid}]]></FromUserName>
                  <CreateTime>${time}</CreateTime>
                  <MsgType><![CDATA[news]]></MsgType>
                  <ArticleCount>1</ArticleCount>
                    <Articles>
                      <item>
                        <Title><![CDATA[我的优惠券]]></Title>
                        <Description><![CDATA[点击查看优惠券详情]]></Description>
                        <PicUrl><![CDATA[http://azz-photo.oss-cn-shenzhen.aliyuncs.com/other/coupon.jpg]]></PicUrl>
                        <Url><![CDATA[${config.SITE_ROOT_URL}/azz/html/coupon.html?openid=${openid}]]></Url>
                      </item>
                    </Articles>
                </xml>`
            return (this.body = redbXml)
          }
        }
      }
      // if(mobile.length == 5) {
      //   let code = mobile
      //   let exist = yield Game.findOne({openid: openid, code: code, done: 'yes', category: 'timeprice'}).exec()
      //   if(exist) {
      //     let redbXml = `<xml>
      //             <ToUserName><![CDATA[${openid}]]></ToUserName>
      //             <FromUserName><![CDATA[${appid}]]></FromUserName>
      //             <CreateTime>${time}</CreateTime>
      //             <MsgType><![CDATA[news]]></MsgType>
      //             <ArticleCount>1</ArticleCount>
      //               <Articles>
      //                 <item>
      //                   <Title><![CDATA[我的优惠券]]></Title>
      //                   <Description><![CDATA[点击查看优惠券详情]]></Description>
      //                   <PicUrl><![CDATA[http://azz-photo.oss-cn-shenzhen.aliyuncs.com/other/coupon.jpg]]></PicUrl>
      //                   <Url><![CDATA[${config.SITE_ROOT_URL}/azz/html/coupon.html?openid=${openid}]]></Url>
      //                 </item>
      //               </Articles>
      //           </xml>`
      //       return (this.body = redbXml)
      //   }
      //   else if(!exist) {
      //     // sendredpack
      //     let presend = yield Game.findOne({code: code, done: 'no', category: 'timeprice'}).exec()
      //     if(!presend) {
      //       let redbXml = `<xml>
      //             <ToUserName><![CDATA[${openid}]]></ToUserName>
      //             <FromUserName><![CDATA[${appid}]]></FromUserName>
      //             <CreateTime>${time}</CreateTime>
      //             <MsgType><![CDATA[text]]></MsgType>
      //             <Content><![CDATA[请先在美甲机限时优惠领取优惠码]]></Content>
      //           </xml>`

      //       return (this.body = redbXml)
      //     }
      //     else { 
      //       presend.openid = openid
      //       presend.done = 'yes'
      //       yield presend.save()
      //       let redbXml = `<xml>
      //             <ToUserName><![CDATA[${openid}]]></ToUserName>
      //             <FromUserName><![CDATA[${appid}]]></FromUserName>
      //             <CreateTime>${time}</CreateTime>
      //             <MsgType><![CDATA[news]]></MsgType>
      //             <ArticleCount>1</ArticleCount>
      //               <Articles>
      //                 <item>
      //                   <Title><![CDATA[我的优惠券]]></Title>
      //                   <Description><![CDATA[点击查看优惠券详情]]></Description>
      //                   <PicUrl><![CDATA[http://azz-photo.oss-cn-shenzhen.aliyuncs.com/other/coupon.jpg]]></PicUrl>
      //                   <Url><![CDATA[${config.SITE_ROOT_URL}/azz/html/coupon.html?openid=${openid}]]></Url>
      //                 </item>
      //               </Articles>
      //           </xml>`
      //       return (this.body = redbXml)
      //     }
      //   }
      // }
      if(mobile.length == 11) {
        let exist = yield Redpack.findOne({openid: openid, send: 'yes', reason: 'subscribe'}).exec()
        if(exist) {
          let redbXml = `<xml>
                  <ToUserName><![CDATA[${openid}]]></ToUserName>
                  <FromUserName><![CDATA[${appid}]]></FromUserName>
                  <CreateTime>${time}</CreateTime>
                  <MsgType><![CDATA[text]]></MsgType>
                  <Content><![CDATA[你的微信已经领取过红包了]]></Content>
                </xml>`

          return (this.body = redbXml)
        }
        else if(!exist) {
          // sendredpack
          let presend = yield Redpack.findOne({mobile: mobile, send: 'no', reason: 'subscribe'}).exec()
          if(!presend) {
            let redbXml = `<xml>
                  <ToUserName><![CDATA[${openid}]]></ToUserName>
                  <FromUserName><![CDATA[${appid}]]></FromUserName>
                  <CreateTime>${time}</CreateTime>
                  <MsgType><![CDATA[text]]></MsgType>
                  <Content><![CDATA[请先参与美甲机红包活动]]></Content>
                </xml>`

            return (this.body = redbXml)
          }
          let hongbao = yield weixinC.pay(openid, presend.amount)
          console.log(hongbao)
          if(hongbao && hongbao.xml && hongbao.xml.result_code &&hongbao.xml.result_code[0]) { 
            presend.openid = openid
            presend.send = 'yes'
            yield presend.save()
          }
        }
      }
    }
  }

  this.body = ''

  // this.body = aa

}


/**
 * @api {post} /redpackMobile   用户通过手机验证红包状态
 * @apiName redpackMobile
 * @apiGroup user
 * @apiPermission anyBody
 *
 * @apiDescription 用户输入手机，并且通过该手机号码领取红包
 *
 * @apiParam {String} mobile 手机号码.
 *
 * @apiExample Example usage:
 * http://test.legle.cc:82/redpackMobile
 *
 * @apiSuccess {Number}   code   1.
 * @apiSuccess {String}   mobile 'yes'代表这个手机已经验证过，不用用户再输入验证码验证，'no'则反.
 * @apiSuccess {String}   sended 'yes'代表这个用户已经领取过红包，不能再次领取.
 * @apiError code 0.
 * @apiError err   err message.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *       "ret": 0
 *       "code": 0
 *     }
 */
exports.redpackMobile = function *(next) {

  let cookie = 'no'
  let sended = 'no'

  let mobile = this.request.body.mobile

  if(this.session.test && mobile == this.session.test.mobile) {
    mobile = 'yes'
  }

  let red = yield Redpack.findOne({mobile: mobile}).exec()

  if(red && red.send == 'yes') {
    sended = 'yes'
  }
  else if(!red) {
    let amount = 1 + Number(Math.random().toFixed(1))
    let redpack = new Redpack({
      mobile: mobile,
      amount: amount,
      reason: 'subscribe'
    })
    yield redpack.save()
  }

  this.body = {
    code: 1,
    mobile: cookie,
    sended: sended
  }

}

/**
 * @api {post} /redpackStatus 检查该手机号码的红包状态
 * @apiName redpackStatus
 * @apiGroup user
 * @apiPermission anyBody
 *
 * @apiDescription 根据用户输入手机，检查该手机号码的红包状态
 *
 * @apiParam {String} mobile 手机号码.
 *
 * @apiExample Example usage:
 * http://test.legle.cc:82/redpackStatus
 *
 * @apiSuccess {Number}   code   1.
 * @apiSuccess {String}   redpack 'yes'代表这个用户已经领取过红包，不能再次领取.
 * @apiSuccess {String}   sended    'yes'代表已经向这个用户发过红包，如果 redpack 为'no'，提醒用户去关注公众号领取红包
 * @apiError code 0.
 * @apiError err   err message.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *       "ret": 0
 *       "code": 0
 *     }
 */
exports.redpackStatus = function *(next) {

  let redpack = 'no'
  let sended = 'no'

  let mobile = this.request.body.mobile


  let red = yield Redpack.findOne({mobile: mobile}).exec()

  if(red) {
    sended = 'yes'
    if(red.send == 'yes') {
      redpack = 'yes'
    }
  }
  else if(!red) {
    let amount = 1 + Number(Math.random().toFixed(1))
    let redpack = new Redpack({
      mobile: mobile,
      amount: amount,
      reason: 'subscribe'
    })
    yield redpack.save()
  }

  this.body = {
    code: 1,
    redpack: redpack,
    sended: sended
  }

}


exports.redpacks = function *(next) {
  console.log(this.query)
  let number = 10
  let pagination = Number(this.query.pagination) - 1
  let mobile = this.query.mobile
  let red

  let count = yield Redpack.count().exec()

  if(mobile) {
    red = yield Redpack.find({mobile: mobile}).exec()
    count = yield Redpack.count({mobile: mobile}).exec()
  }
  else {
    red = yield Redpack.find().skip(number*pagination).limit(10).sort({'meta.updatedAt': -1}).exec()
  }


  this.body = {
    code: 1,
    datas: red,
    count:count
  }
}



/**
 * @api {get} /sendVerifyCode  用手机号码发验证码，AR  或者 客户端 都是可以的
 * @apiName sendVerifyCode
 * @apiGroup user
 * @apiPermission anyBody
 *
 * @apiDescription signup for client or user.
 *
 * @apiParam {String} mobile 手机号码.
 *
 * @apiExample Example usage:
 * http://test.legle.cc:82/sendVerifyCode
 *
 * @apiSuccess {Number}   code   1.
 * @apiSuccess {String}   err 'ok'.
 * @apiError code 0.
 * @apiError err   err message.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *       "ret": 0
 *       "code": 0
 *     }
 */
exports.sendVerify = function *(next) {
  let mobile = this.query.mobile

  if(!mobile) {
    return (this.body = {
      code: 0,
      err: 'mobile not found'
    })
  }

  sms.newCode({mobi:mobile})

  this.body = {
    code: 1
  }
}


/**
 * @api {post} /userCodeLogin   用户验证码登录
 * @apiName userCodeLogin
 * @apiGroup user
 * @apiPermission anyBody
 *
 * @apiDescription userCodeLogin for client or user.
 *
 * @apiParam {String} mobile 手机号码.
 *
 * @apiExample Example usage:
 * http://test.legle.cc:82/userCodeLogin
 *
 * @apiSuccess {Number}   code   1.
 * @apiSuccess {String}   err 'ok'.
 * @apiError code 0.
 * @apiError err   err message.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *       "ret": 0
 *       "code": 0
 *     }
 */
exports.userCodeLogin = function *(next) {
  let mobile = this.request.body.mobile
  let code = this.request.body.code
  

  if(!mobile || !code) {
    return (this.body = {
      code: 0,
      err: 'mobile or code not found'
    })
  }
  if (!sms.checkCode({mobi:mobile,code:code})) {
    return (this.body = {
      code: 0,
      err: Msg.USER.CODE_ERROR
    })
  }

  let mobileClient = yield User.findOne({mobile: mobile}).exec()
  if (!mobileClient) {
    let newUser = new User({
      mobile: mobile,
      password: code
    })

    yield newUser.save()
  }

  this.session.test = {
    mobile: mobile
  }

  
  this.body = {
    code: 1,
    err: 'ok'
  }
}

/**
 * @api {post} /userLogin   用户登录
 * @apiName userLogin
 * @apiGroup user
 * @apiPermission anyBody
 *
 * @apiDescription 用户手机和密码登录
 *
 * @apiParam {String} mobile 手机号码
 * @apiParam {String} password 用户密码
 *
 * @apiExample Example usage:
 * http://test.legle.cc:82/userLogin
 *
 * @apiSuccess {Number}   code   1.
 * @apiSuccess {String}   err 'ok'.
 * @apiError code 0.
 * @apiError err   err message.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *       "ret": 0
 *       "code": 0
 *     }
 */
exports.userLogin = function *(next) {
  let mobile = this.request.body.mobile || ''
  let password = this.request.body.password

  if(!mobile || !password) {
    return (this.body = {
      code: 0,
      err: 'mobile or password not found'
    })
  }

  const existUser = yield User.findOne({mobile:mobile}).exec()
  if (!existUser) {
    return (this.body = {
      code: 0,
      err: Msg.USER.USER_NOT_EXIST
    })
  }
  let match = yield existUser.comparePassword(password, existUser.password)
  if (!match) {
    return (this.body = {
      code: 0,
      err: Msg.USER.PWD_ERROR
    })
  }
  this.session.test = {
    userId:existUser._id,
    mobile:existUser.mobile
  }
  this.body = {
    code: 1,
    userId:existUser.id,
    err: 'ok'
  }

}


/**
 * @api {post} /newPassword   设置新密码
 * @apiName newPassword
 * @apiGroup user
 * @apiPermission anyBody
 *
 * @apiDescription 用户设置新密码
 *
 * @apiParam {String} password 用户新密码
 *
 * @apiExample Example usage:
 * http://test.legle.cc:82/newPassword
 *
 * @apiSuccess {Number}   code   1.
 * @apiSuccess {String}   err 'ok'.
 * @apiError code 0.
 * @apiError err   err message.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *       "ret": 0
 *       "code": 0
 *     }
 */
exports.newPassword = function *(next) {
  let password = this.request.body.password
  if (!password) {
    return (this.body = {
      code: 0,
      err: ''
    })
  }

  if (!this.session.test) {
    return (this.body = {
      code: 0,
      err: '请先登录'
    })
  }
  console.log(this.session.test)
  let mobile = this.session.test.mobile

  const existUser = yield User.findOne({mobile:mobile}).exec()
  if (!existUser) {
    return (this.body = {
      code: 0,
      err: Msg.USER.USER_NOT_EXIST
    })
  }

  existUser.password = password

  yield existUser.save()

  this.body = {
    code: 1,
    userId:existUser.id,
    err: 'ok'
  }

}

/**
 * @api {post} /updatePassword   更新密码
 * @apiName updatePassword
 * @apiGroup user
 * @apiPermission anyBody
 *
 * @apiDescription 更新密码
 *
 * @apiParam {String} password 更新密码
 *
 * @apiExample Example usage:
 * http://test.legle.cc:82/updatePassword
 *
 * @apiSuccess {Number}   code   1.
 * @apiSuccess {String}   err 'ok'.
 * @apiError code 0.
 * @apiError err   err message.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *       "ret": 0
 *       "code": 0
 *     }
 */
exports.updatePassword = function *(next) {
  let password = this.request.body.password

  if (!password) {
    return (this.body = {
      code: 0,
      err: '新密码未输入'
    })
  }


  let mobile = this.session.test.mobile

  const existUser = yield User.findOne({mobile:mobile}).exec()
  if (!existUser) {
    return (this.body = {
      code: 0,
      err: Msg.USER.USER_NOT_EXIST
    })
  }

  existUser.password = password

  yield existUser.save()

  this.body = {
    code: 1,
    userId:existUser.id,
    err: 'ok'
  }

}


/**
 * @api {post} /forgetPassword    忘记密码
 * @apiName forgetPassword
 * @apiGroup user
 * @apiPermission anyBody
 *
 * @apiDescription  忘记密码
 *
 * @apiParam {String} password  忘记密码
 *
 * @apiExample Example usage:
 * http://test.legle.cc:82/forgetPassword
 *
 * @apiSuccess {Number}   code   1.
 * @apiSuccess {String}   err 'ok'.
 * @apiError code 0.
 * @apiError err   err message.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *       "ret": 0
 *       "code": 0
 *     }
 */
exports.forgetPassword = function *(next) {
  let password = this.request.body.password
  let mobile = this.request.body.mobile
  let code = this.request.body.code

  if (!password) {
    return (this.body = {
      code: 0,
      err: ''
    })
  }

  if (!this.session.test) {
    return (this.body = {
      code: 0,
      err: '请先登录'
    })
  }

  const existUser = yield User.findOne({mobile:mobile}).exec()
  if (!existUser) {
    return (this.body = {
      code: 0,
      err: Msg.USER.USER_NOT_EXIST
    })
  }

  existUser.password = password

  yield existUser.save()

  this.body = {
    code: 1,
    userId:existUser.id,
    err: 'ok'
  }

}


/**
 * @api {post} /pcVerifyMobile  明星面对面 颜值测试 纹眉 验证手机
 * @apiName pcVerifyMobile
 * @apiGroup PcStarTest
 * @apiPermission anyBody
 *
 * @apiDescription 明星面对面 颜值测试 纹眉 验证手机
 *
 * @apiParam {String} uuid 用户uuid.
 * @apiParam {String} mobile 用户mobile.
 * @apiParam {Number/String} code 用户code.
 * @apiParam {String} type 明星面对面 star；颜值测试 face；纹眉 eyebrow.
 *
 * @apiExample Example usage:
 * http://test.legle.cc:82/pcVerifyMobile
 *
 * @apiSuccess {uuid}   code   1.
 * @apiSuccess {String}   err 'ok'.
 * @apiError code 0.
 * @apiError err   err message.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *       "code": 1
 *       "err": 'ok'
 *     }
 */ 
exports.pcVerifyMobile = function *(next) {

  console.log(this.request.body)

  let uuid = this.request.body.uuid || ''
  let mobile = this.request.body.mobile || ''
  let code = this.request.body.code || ''
  let type = this.request.body.type || ''

  if (!mobile) {
    return (this.body = {
      ret: 0,
      err: 'uuid or mobile not found'
    })
  }
  if (!sms.checkCode({mobi:mobile,code:code})) {
    return (this.body = {
      ret: 0,
      err: Msg.USER.CODE_ERROR
    })
  }

  if(type == 'star') {
    let star = yield StarTest.findOne({uuid:uuid}).exec()
    star.mobile = mobile
    yield star.save()
  }

  if(this.session.test) { 
    this.session.test.mobile = mobile
  }
  else {
    this.session.test = {
      mobile: mobile
    }
  }

  if(type == 'face') {
    let face = yield Face.findOne({uuid:uuid}).exec()
    face.mobile = mobile
    yield face.save()
  }

  if(type == 'eyebrow') {
    let eyebrow = yield Eyebrow.findOne({uuid:uuid}).exec()
    eyebrow.mobile = mobile
    yield eyebrow.save()
  }
  this.body = {
    code: 1,
    err: 'ok'
  }

}

exports.getStarsToken = function *(next) {

  let results = yield aliyun.accessToken('stars')

  this.body = results
}

exports.getStsQc = function *(next) {

  let results = yield aliyun.accessSts()

  this.body = {
    token: results.Credentials
  }
}

exports.getSts = function *(next) {

  let results
  try {
    results = yield aliyun.accessSts()
  } catch(err) {
    console.log(err)
    return (this.body = {
      ret: 0,
      result: err
    })
  }

  this.body = {
    ret: 1,
    results: results
  }

}



