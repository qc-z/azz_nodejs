'use strict'

const mongoose = require('mongoose')
const Client = mongoose.model('Client')
// const _ = require('lodash')
const xss = require('xss')
const sms = require('../service/sms')
const Msg = require('../libs/msg')
const facepp = require('../service/facepp')
const recommendJson = require('../../config/json/recommend.json')
const recommendsJson = require('../../config/json/recommends.json')
const Face = mongoose.model('Face')
const Advertisement = mongoose.model('Advertisement')
const Newpic = mongoose.model('Newpic')
const Skin = mongoose.model('Skin')
const StarTest = mongoose.model('Startest')
const config = require('../../config/config')
const BeautyProject = mongoose.model('BeautyProject')
const xlsx = require('node-xlsx')
const moment = require('moment')
const Template = mongoose.model('Template')


/**
 * @api {post} /addVideo  店主添加视频
 * @apiName addVideo
 * @apiGroup Client
 * @apiPermission Client
 *
 * @apiDescription  美甲店添加广告视频
 *
 * @apiParam {String} url 视频地址
 *
 * @apiExample Example usage:
 * http://azz.legle.cc/addVideo
 *
 * @apiSuccess {Number}   code   1.
 * @apiSuccess {String}   err 'ok'.
 *
 * @apiError code 0.
 * @apiError err   err message.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *       "code": 0
 *       "error": "user not found"
 *     }
 */
exports.addVideo = function *(next) {
    if(!this.session.client) {
        return (
            this.body = {
                code: 0,
                err: '用户没有登录，请登录'
            }
        )
    }
    let clientId =  this.session.client.clientId || ''

    let url = this.request.body.url

    console.log('body======', this.request.body)

    let client = yield Client.findOne({_id: clientId}).exec()

    client.video = {
      url: url
    }

    client.markModified('video')
    yield client.save()
    
    this.body = {
        code: 1,
        err: '添加视频广告成功'
    }
}

/**
 * @api {get} /getVideo  店主获取视频
 * @apiName getVideo
 * @apiGroup Client
 * @apiPermission Client
 *
 * @apiDescription  美甲店获取广告视频
 *
 * @apiExample Example usage:
 * http://azz.legle.cc/getVideo
 *
 * @apiSuccess {Number}   code   1.
 * @apiSuccess {String}   err 'ok'.
 *
 * @apiError code 0.
 * @apiError err   err message.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *       "code": 0
 *       "error": "user not found"
 *     }
 */
exports.getVideo = function *(next) {

    let clientId =  this.session.client.clientId || ''

    let client = yield Client.findOne({_id: clientId}).exec()

    let url

    if(client.video && client.video.url) {
      url = client.video.url
    }

    this.body = {
        code: 1,
        url: url
    }
}



exports.exportExel = function *(next) {

  if(!this.session.client) {
    return (this.body = {
      ret: 0,
      err: '请先登录'
    })
  }

  let id = this.session.client.clientId

  let faces = yield Face.find({clientId: id, mobile: {$exists: true}}).exec()
  let skins = yield Skin.find({clientId: id, mobile: {$exists: true}}).exec()
  let startests = yield StarTest.find({clientId: id, mobile: {$exists: true}}).exec()


  let faceArrs = [['客户电话','访问日期','客户来源','测试次数']]
  for(let i in faces) {
    let faceArr = []
    faceArr.push(faces[i].mobile)
    faceArr.push(moment(faces[i]['meta.updatedAt']).format('YYYY-MM-DD HH:mm'))

    let ot = faces[i].originType == 'AR' ? '到店测试' : '在线测试'

    faceArr.push(ot)
    faceArr.push(faces[i].testTimes)
    faceArrs.push(faceArr)
  }

  let skinArrs = [['客户电话','访问日期','客户来源','测试次数']]
  for(let i in skins) {
    let skinArr = []
    skinArr.push(skins[i].mobile)
    skinArr.push(moment(skins[i]['meta.updatedAt']).format('YYYY-MM-DD HH:mm'))

    let ot = skins[i].originType == 'AR' ? '到店测试' : '在线测试'

    skinArr.push(ot)
    skinArr.push(skins[i].testTimes)
    skinArrs.push(skinArr)
  }

  let startestArrs = [['客户电话','访问日期','客户来源','测试次数']]
  for(let i in startests) {
    let startestArr = []
    startestArr.push(startests[i].mobile)
    startestArr.push(moment(startests[i]['meta.updatedAt']).format('YYYY-MM-DD HH:mm'))

    let ot = startests[i].originType == 'AR' ? '到店测试' : '在线测试'

    startestArr.push(ot)
    startestArr.push(startests[i].testTimes)
    startestArrs.push(startestArr)
  }

  var buffer = xlsx.build([{name: '颜值测试', data: faceArrs}, {name: '皮肤测试', data: skinArrs}, {name: '明星面对面', data: startestArrs}]) // returns a buffer
  var excelname = 'user-data.xlsx'

  this.set('Content-disposition', 'attachment; filename=' + excelname)
  this.set('Content-type', 'application/vnd.openxmlformats')

  this.body = buffer

}

/**
 * @api {post} /clientSignupPhone  Client signup by phone
 * @apiName SetClient
 * @apiGroup Client
 * @apiPermission anyBody
 *
 * @apiDescription signup for client.
 *
 * @apiParam {String} username The Client-name
 * @apiParam {String} mobile The Client-mobile
 * @apiParam {String} password The Client-password
 * @apiParam {String} deviceId The Client-deviceId
 * @apiParam {String} conformPassword The Client-conformPassword
 * @apiParam {Number} code The Client-phone verify code
 *
 * @apiExample Example usage:
 * http://test.legle.cc:82/clientSignupPhone
 *
 * @apiSuccess {Number}   code   1.
 * @apiSuccess {String}   err 'ok'.
 *
 * @apiError code 0.
 * @apiError err   err message.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *       'code': 0
 *       "error": "用户密码不匹配"
 *     }
 */
exports.signupPhone = function *(next) {

  let deviceId = this.request.body.deviceId || ''
  let username = this.request.body.username
  let avatar = this.request.body.avatar || ''
  let mobile = this.request.body.mobile
  let password = this.request.body.password
  let conformPassword = this.request.body.conformPassword
  let code = this.request.body.code.toString()

  let existClient = yield Client.findOne({username: username}).exec()
  let mobileClient = yield Client.findOne({mobile: mobile}).exec()
  if (existClient) {
    this.body = {
      code: 0,
      err: Msg.USER.USERNAME_EXIST
    }
  }
  else if (mobileClient) {
    this.body = {
      code: 0,
      err: Msg.USER.USER_PHONE_EXIST
    }
  }
  else if (password !== conformPassword) {
    this.body = {
      code: 0,
      err: Msg.USER.TWO_PWD_UNMATCH
    }
  }
  else {
    if (!sms.checkCode({mobi:mobile,code:code})) {
      this.body = {
        code: 0,
        err: Msg.USER.CODE_ERROR
      }
    }
    else {
      let date = new Date()
      let oneYearDate = date.setFullYear(date.getFullYear() + 1)
 
      let _deviceId = [deviceId]
      if(!deviceId) {
        _deviceId = []
      }

      const updateData = {
        mobile: xss(mobile),
        username: xss(username),
        avatar: xss(avatar),
        password: xss(password),
        deviceId: _deviceId,
        deviceLimit: 100,
        skinRole: {
          role: true,
          from: Date.now(),
          to: oneYearDate
        },
        starRole: {
          role: true,
          from: Date.now(),
          to: oneYearDate
        },
        faceRole: {
          role: true,
          from: Date.now(),
          to: oneYearDate
        }
      }

      const savedClient = new Client(updateData)
      yield savedClient.save()

      this.session.client = {
        clientId: savedClient._id,
        username: savedClient.username,
        mobile: savedClient.mobile
      }

      this.body = {
        code: 1,
        clientId: savedClient._id,
        err: 'ok'
      }
    }
  }
}


/**
 * @api {post} /editInfo  Client user edit their company information
 * @apiName EditClientInfo
 * @apiGroup Client
 * @apiPermission Client
 *
 * @apiDescription Client user edit their company information.
 *
 * @apiParam {String} shopName The Client-shop name.
 * @apiParam {String} shopAddr The Client-shopAddr.
 * @apiParam {String} qrcode The Client-qrcode.
 * @apiParam {String} logo The Client-logo.
 * @apiParam {String} customerInfo The Client-introduction.
 * @apiParam {String} customerAd The Client-Ad.
 * @apiParam {String} autoReply The Client-the auto reply for SocketIo.
 *
 * @apiExample Example usage:
 * http://test.legle.cc:82/editInfo
 *
 * @apiSuccess {Number}   code   1.
 * @apiSuccess {String}   err 'ok'.
 *
 * @apiError code 0.
 * @apiError err   err message.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *       "code": 0
 *       "error": "用户没有登录"
 *     }
 */
exports.editInfo = function *(next) {
  const body = this.request.body
  // if(!this.session.client) {
  //   return(this.body = {
  //     code: 0,
  //     err: '请先登录'
  //   })
  // }
  let mobile =  body.mobile
  if(!body) {
    return(this.body = {
      code: 0,
      err: Msg.COMMON.DATA_EMPTY
    })
  }

  if(!mobile) {
    return(this.body = {
      code: 0,
      err: Msg.USER.PHONE_IS_REQUIRED
    })
  }

  const update = {
    $set: {
      phoneNumber: xss(body.phoneNumber),
      shopName: xss(body.shopName),
      shopAddr: xss(body.shopAddr),
      avatar: xss(body.avatar),
      customerInfo: xss(body.customerInfo),
      customerAd: xss(body.customerAd),
      autoReply: xss(body.autoReply)
    }
  }




  yield Client.update({mobile: mobile}, update).exec()

  this.body = {
    code: 1,
    err: 'ok'
  }

}


// 超级管理员 添加店长信息
exports.add = function *(next) {

  if(!this.session.sysMember) {
    return (this.body = {
      ret: 0,
      err: '请先登录'
    })
  }

  // let clientId = this.session.client.clientId

  let body = this.request.body

  let mobile = body.mobile || ''

  let clientExist = yield Client.findOne({mobile: mobile}).exec()

  if(clientExist) {
    return (this.body = {
      ret: 0,
      err: '该类目已存在'
    })
  }

  let bodykeys = Object.keys(body)


  let _client = new Client()

  if(bodykeys.length > 0) {
    for (let i = bodykeys.length - 1; i >= 0; i--) {
      _client[bodykeys[i]] = body[bodykeys[i]]
    }
    yield _client.save()
  }

  this.body = {
    ret: 1,
    client: _client,
    err: 'ok'
  }
}



// 超级管理员 编辑店长信息
exports.edit = function *(next) {

  if(!this.session.sysMember) {
    return (this.body = {
      ret: 0,
      err: '请先登录'
    })
  }

  let body = this.request.body
  let bodykeys = Object.keys(body)

  let _id = body._id

  let _client = yield Client.findOne({_id: _id}).exec()


  if(bodykeys.length > 0 && _client) {
    for (let i = bodykeys.length - 1; i >= 0; i--) {
      if(body[bodykeys[i]]) {
        _client[bodykeys[i]] = body[bodykeys[i]]
      }
    }
    yield _client.save()
  }

  this.body = {
    ret: 1,
    client: _client,
    err: 'ok'
  }
}


// 超级管理员 删除店长信息
exports.del = function *(next) {

  if(!this.session.sysMember) {
    return (this.body = {
      ret: 0,
      err: '请先登录'
    })
  }
  // let clientId = this.session.client.clientId

  let _id = this.request.body._id

  let _client = yield Client.findOne({_id: _id}).exec()

  if(!_client) {
    return (this.body = {
      ret: 0,
      err: '该数据不存在'
    })
  }
  yield _client.remove()

  this.body = {
    ret: 1,
    err: 'ok'
  }
}

exports.getClient = function *(next) {

  console.log(this.query)
  // p
  let content = this.query.content || ''
  let number = this.query.pageNumber || 1
  let skip = (number - 1) * 10
  let query = {}
  let clients
  if(content){
    query.mobile = content
    clients = yield Client.find(query).exec()
  }else{
    clients = yield Client.find(query).sort({'meta.createdAt': -1}).skip(skip).limit(10).exec()
  }
  let recordTotal = yield Client.count(query).exec()
  this.body = {
    ret: 1,
    clients: clients,
    recordTotal: recordTotal,
    err: 'ok'
  }

}

exports.getRecommend = function *(next) {
  this.body = recommendJson || {}
}

exports.getRecommendArr = function *(next) {
  this.body = recommendsJson || []
}

/**
 * @api {post} /clientLogin  Client login arpt
 * @apiName ClientLogin
 * @apiGroup Client
 * @apiPermission Client
 *
 * @apiDescription Client login.
 *
 * @apiParam {String} username The Client-username.
 * @apiParam {String} password The Client-password.
 *
 * @apiExample Example usage:
 * http://test.legle.cc:82/clientLogin
 *
 * @apiSuccess {Number}   code   1.
 * @apiSuccess {String}   err 'ok'.
 *
 * @apiError code 0.
 * @apiError err   err message.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *       "code": 0
 *       "error": "用户不存在"
 *     }
 */
exports.Login = function *(next) {
    let username = this.request.body.username
    let password = this.request.body.password

  const existClient = yield Client.findOne({username:username}).exec()
  if (!existClient) {
    return (this.body = {
      code: 0,
      err: Msg.USER.USER_NOT_EXIST
    })
  }
  let match = yield existClient.comparePassword(password, existClient.password)
  if (!match) {
    return (this.body = {
      code: 0,
      err: Msg.USER.PWD_ERROR
    })
  }
  this.session.client = {
    clientId:existClient._id,
    username:existClient.username,
    mobile:existClient.mobile
  }
  this.body = {
    code: 1,
    clientId:existClient.id,
    client:existClient,
    err: 'ok'
  }
}

/**
 * @api {post} /clientUpdatePassword  Client update password arpt
 * @apiName updatePassword
 * @apiGroup Client
 * @apiPermission Client
 *
 * @apiDescription Client update password.
 *
 * @apiParam {String} oldPassword The Client-oldPassword.
 * @apiParam {String} newPassword The Client-newPassword.
 * @apiParam {String} conformPassword The Client-conformPassword.
 *
 * @apiExample Example usage:
 * http://test.legle.cc:82/clientUpdatePassword
 *
 * @apiSuccess {Number}   code  1.
 * @apiSuccess {String}   err 'ok'.
 *
 * @apiError code 0.
 * @apiError err   err message.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *       "code": 0
 *       "error": "用户密码错误"
 *     }
 */
exports.updatePassword = function *(next) {

    let oldPassword = this.request.body.oldPassword
    let newPassword = this.request.body.newPassword
    let conformPassword = this.request.body.conformPassword

    if(!this.session.client) {
      return (this.body = {
          code:1,
          err: 'please login first'
      })
    }
    let clientId = this.session.client.clientId
    if (newPassword !== conformPassword) {
        return (this.body = {
            code: 0,
            err: Msg.USER.TWO_PWD_UNMATCH
        })
    }
    const existClient = yield Client.findOne({_id:clientId}).exec()
    let match = yield existClient.comparePassword(oldPassword, existClient.password)
    if (!match) {
        return (this.body = {
            code: 0,
            err: Msg.USER.PWD_ERROR
        })
    }
    existClient.password=newPassword
    yield existClient.save()
    this.body = {
        code:1,
        err: 'ok'
    }
}


/**
 * @api {post} /clientSignOut  Client login out
 * @apiName Client signout
 * @apiGroup Client
 * @apiPermission Client
 *
 * @apiDescription Client logOut.
 *
 *
 * @apiExample Example usage:
 * http://test.legle.cc:82/clientSignOut
 *
 * @apiSuccess {Number}   code   1.
 * @apiSuccess {String}   err 'ok'.
 *
 * @apiError code 0.
 * @apiError err   err message.
 *
 */
exports.signOut = function *(next) {
  this.logout()
  delete this.session.client
  this.body = {
    code:1,
    err: 'ok'
  }
}


/**
 * @api {post} /clientGetBackPassword  Client Get Back password arpt
 * @apiName getBackPassword
 * @apiGroup Client
 * @apiPermission Client
 *
 * @apiDescription Client get back password.
 *
 * @apiParam {String} mobile The Client-mobile.
 * @apiParam {String} newPassword The Client-newPassword.
 * @apiParam {String} conformPassword The Client-conformPassword.
 * @apiParam {String} code The Client-mobileCode.
 *
 *
 * @apiExample Example usage:
 * http://test.legle.cc:82/clientUpdatePassword
 *
 * @apiSuccess {Number}   code   1.
 * @apiSuccess {String}   err 'ok'.
 *
 * @apiError code 0.
 * @apiError err   err message.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *       "code": 0
 *       "error": "手机验证码错误"
 *     }
 */
exports.getBackPassword = function *(next) {

    let mobile = this.request.body.mobile
    let newPassword = this.request.body.newPassword
    let conformPassword = this.request.body.conformPassword
    let code = this.request.body.code.toString()



    if (newPassword !== conformPassword) {
        return (this.body = {
            code: 0,
            err: Msg.USER.TWO_PWD_UNMATCH
        })
    }

    if (sms.checkCode({mobi:mobile,code:code})) {
        return(this.body = {
            code: 0,
            err: Msg.USER.CODE_ERROR
        })
    }

    const existClient = yield Client.findOne({mobile:mobile}).exec()
    existClient.password = newPassword
    yield existClient.save()

    this.body = {
        code:1,
        err: 'ok'
    }
}

exports.getInfo = function *(next) {
  // let client = this.session.client
  // if(!client) {
  //   return (this.body = {
  //     code: 0,
  //     err: '请先登录'
  //   })
  // }
  let clientId = this.query.clientId

  let _client = yield Client.findOne({_id: clientId})

  this.body = {
    code: 1,
    client: _client
  }

}

exports.creatChat = function *(next) {
  let clients = yield Client.find().exec()

  for (var i = 0; i < clients.length; ++i) {
    yield facepp.creatChat(clients[i]._id)
  }

  this.body = {
    code: 1,
    err: 'ok'
  }
}

exports.uploadImg = function *(next) {

  let body = this.request.body.fields.data

  if(!body) {
    return (this.body = {code:0,err:'传入参数有误'})
  }

  body = JSON.parse(body)

  if(!this.request.body.files || !this.request.body.files.file || !this.request.body.files.file.path) {
    return (this.body = {code:0,err:'没有收到文件'})
  }


  let _client = yield Client.findOne({_id: body.clientId}).exec()

  if(!_client) {
    return (this.body = {
      code: 0,
      err: '没有这个用户'
    })
  }

  if (this.request.body.files && this.request.body.files.file && this.request.body.files.file.path) {
    this.request.body.files.file.path = this.request.body.files.file.path.split('public/')[1]
  }
  if(body.type === 'qrcode') {
    _client.qrcode = this.request.body.files.file.path
  }

  if(body.type === 'logo') {
    _client.logo = this.request.body.files.file.path
  }

  yield _client.save()

  this.body = {
    code: 1,
    err: 'ok',
  }
}


/**
 * @api {get} /clientDeleteTestData  Client Delete User Test Data arpt
 * @apiName DeleteTestData
 * @apiGroup Client
 * @apiPermission Client
 *
 * @apiDescription  Client Delete User Test Data.
 *
 * @apiParam {String} userId The user-userId.
 * @apiParam {String} otherCondition The delete-otherCondition.
 *
 * @apiExample Example usage:
 * http://test.legle.cc:82/clientUpdatePassword
 *
 * @apiSuccess {Number}   code   1.
 * @apiSuccess {String}   err 'ok'.
 *
 * @apiError code 0.
 * @apiError err   err message.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *       "code": 0
 *       "error": "user not found"
 *     }
 */
exports.deleteTestData = function *(next) {
    let uuid = this.request.query.uuid
    let otherCondition = this.request.query.otherCondition
    otherCondition = Number(otherCondition)
    if(!uuid) {
        return (this.body = {
            code: 0,
            err: Msg.USER.NOT_FOUND_USER
        })
    }
    // 1：face  2：skin
    switch (otherCondition)
    {
        case 1:
            yield Face.remove({uuid:uuid}).exec()
            break;
        case 2:
            yield Skin.remove({uuid:uuid}).exec()
            break;
    }
    this.body = {
        code: 1,
        err: Msg.USER.DELETE_SUCCESS
    }
}


/**
 * @api {get} /clientGetCountData  Client Delete User Test Data arpt
 * @apiName DeleteTestData
 * @apiGroup Client
 * @apiPermission Client
 *
 * @apiDescription  Client Delete User Test Data.
 *
 * @apiParam {String} queryDate The date.
 * @apiParam {String} clienId The clienId.
 *
 * @apiExample Example usage:
 * http://test.legle.cc:82/clientGetCountData
 *
 * @apiSuccess {Number}   code   1.
 * @apiSuccess {String}   err 'ok'.
 *
 */
exports.getCountData = function *(next) {

    var oneDay = 86400000;
    let queryDate = this.request.query.queryDate
    let clientId = this.request.query.clientId

    if(this.session.client) { 
      clientId =  this.session.client.clientId
    }
    var toDay
    var obj
    if(!queryDate) {
        let toDay = new Date(new Date().setHours(0, 0, 0, 0))
        toDay = toDay.getTime()
        var a = toDay + oneDay
        var b = toDay - oneDay
        var c = toDay - oneDay * 2
        var d = toDay - oneDay * 3
        var e = toDay - oneDay * 4
        var f = toDay - oneDay * 5
        var g = toDay - oneDay * 6
        let faceCount1 = yield Face.count({mobile: {$exists: true}, clientId: clientId ,'meta.updatedAt':{$gte: toDay, $lt: a}}).exec()  //18~19
        let faceCount2 = yield Face.count({mobile: {$exists: true}, clientId: clientId ,'meta.updatedAt':{$gte: b    , $lt: toDay}}).exec() //17—~18
        let faceCount3 = yield Face.count({mobile: {$exists: true}, clientId: clientId ,'meta.updatedAt':{$gte: c    , $lt: b}}).exec() //16~17
        let faceCount4 = yield Face.count({mobile: {$exists: true}, clientId: clientId ,'meta.updatedAt':{$gte: d    , $lt: c}}).exec() //15~16
        let faceCount5 = yield Face.count({mobile: {$exists: true}, clientId: clientId ,'meta.updatedAt':{$gte: e    , $lt: d}}).exec() //14~15
        let faceCount6 = yield Face.count({mobile: {$exists: true}, clientId: clientId ,'meta.updatedAt':{$gte: f    , $lt: e}}).exec() //13~14
        let faceCount7 = yield Face.count({mobile: {$exists: true}, clientId: clientId ,'meta.updatedAt':{$gte: g    , $lt: f}}).exec() //12~13

        let skinCount1 = yield Skin.count({mobile: {$exists: true}, clientId: clientId ,'meta.updatedAt':{$gte: toDay, $lt: a}}).exec()  //18~19
        let skinCount2 = yield Skin.count({mobile: {$exists: true}, clientId: clientId ,'meta.updatedAt':{$gte: b    , $lt: toDay}}).exec() //17—~18
        let skinCount3 = yield Skin.count({mobile: {$exists: true}, clientId: clientId ,'meta.updatedAt':{$gte: c    , $lt: b}}).exec() //16~17
        let skinCount4 = yield Skin.count({mobile: {$exists: true}, clientId: clientId ,'meta.updatedAt':{$gte: d    , $lt: c}}).exec() //15~16
        let skinCount5 = yield Skin.count({mobile: {$exists: true}, clientId: clientId ,'meta.updatedAt':{$gte: e    , $lt: d}}).exec() //14~15
        let skinCount6 = yield Skin.count({mobile: {$exists: true}, clientId: clientId ,'meta.updatedAt':{$gte: f    , $lt: e}}).exec() //13~14
        let skinCount7 = yield Skin.count({mobile: {$exists: true}, clientId: clientId ,'meta.updatedAt':{$gte: g    , $lt: f}}).exec() //12~13

        let starCount1 = yield StarTest.count({mobile: {$exists: true}, clientId: clientId ,'meta.updatedAt':{$gte: toDay, $lt: a}}).exec()  //18~19
        let starCount2 = yield StarTest.count({mobile: {$exists: true}, clientId: clientId ,'meta.updatedAt':{$gte: b    , $lt: toDay}}).exec() //17—~18
        let starCount3 = yield StarTest.count({mobile: {$exists: true}, clientId: clientId ,'meta.updatedAt':{$gte: c    , $lt: b}}).exec() //16~17
        let starCount4 = yield StarTest.count({mobile: {$exists: true}, clientId: clientId ,'meta.updatedAt':{$gte: d    , $lt: c}}).exec() //15~16
        let starCount5 = yield StarTest.count({mobile: {$exists: true}, clientId: clientId ,'meta.updatedAt':{$gte: e    , $lt: d}}).exec() //14~15
        let starCount6 = yield StarTest.count({mobile: {$exists: true}, clientId: clientId ,'meta.updatedAt':{$gte: f    , $lt: e}}).exec() //13~14
        let starCount7 = yield StarTest.count({mobile: {$exists: true}, clientId: clientId ,'meta.updatedAt':{$gte: g    , $lt: f}}).exec() //12~13


        let toTheStore1 =
             Number(yield Face.count({mobile: {$exists: true}, clientId: clientId,originType:"AR",'meta.updatedAt':{$gte: toDay, $lt: a}}).exec()) //18~19
            +Number(yield Skin.count({mobile: {$exists: true}, clientId: clientId,originType:"AR",'meta.updatedAt':{$gte: toDay, $lt: a}}).exec())//18~19
            +Number(yield StarTest.count({mobile: {$exists: true}, clientId: clientId,originType:"AR",'meta.updatedAt':{$gte: toDay, $lt: a}}).exec()) //18~19

        let toTheStore2 =
             Number(yield Face.count({mobile: {$exists: true}, clientId: clientId,originType:"AR",'meta.updatedAt':{$gte: b, $lt: toDay}}).exec()) //18~19
            +Number(yield Skin.count({mobile: {$exists: true}, clientId: clientId,originType:"AR",'meta.updatedAt':{$gte: b, $lt: toDay}}).exec()) //18~19
            +Number(yield StarTest.count({mobile: {$exists: true}, clientId: clientId,originType:"AR",'meta.updatedAt':{$gte: b, $lt: toDay}}).exec()) //18~19

        let toTheStore3 =
             Number(yield Face.count({mobile: {$exists: true}, clientId: clientId,originType:"AR",'meta.updatedAt':{$gte: c, $lt: b}}).exec()) //18~19
            +Number(yield Skin.count({mobile: {$exists: true}, clientId: clientId,originType:"AR",'meta.updatedAt':{$gte: c, $lt: b}}).exec())  //18~19
            +Number(yield StarTest.count({mobile: {$exists: true}, clientId: clientId,originType:"AR",'meta.updatedAt':{$gte: c, $lt: b}}).exec())  //18~19

        let toTheStore4 =
             Number(yield Face.count({mobile: {$exists: true}, clientId: clientId,originType:"AR",'meta.updatedAt':{$gte: d, $lt: c}}).exec())  //18~19
            +Number(yield Skin.count({mobile: {$exists: true}, clientId: clientId,originType:"AR",'meta.updatedAt':{$gte: d, $lt: c}}).exec()) //18~19
            +Number(yield StarTest.count({mobile: {$exists: true}, clientId: clientId,originType:"AR",'meta.updatedAt':{$gte: d, $lt: c}}).exec())  //18~19

        let toTheStore5 =
             Number(yield Face.count({mobile: {$exists: true}, clientId: clientId,originType:"AR",'meta.updatedAt':{$gte: e, $lt: d}}).exec()) //18~19
            +Number(yield Skin.count({mobile: {$exists: true}, clientId: clientId,originType:"AR",'meta.updatedAt':{$gte: e, $lt: d}}).exec())  //18~19
            +Number(yield StarTest.count({mobile: {$exists: true}, clientId: clientId,originType:"AR",'meta.updatedAt':{$gte: e, $lt: d}}).exec()) //18~19

        let toTheStore6 =
             Number(yield Face.count({mobile: {$exists: true}, clientId: clientId,originType:"AR",'meta.updatedAt':{$gte: f, $lt: e}}).exec())  //18~19
            +Number(yield Skin.count({mobile: {$exists: true}, clientId: clientId,originType:"AR",'meta.updatedAt':{$gte: f, $lt: e}}).exec())  //18~19
            +Number(yield StarTest.count({mobile: {$exists: true}, clientId: clientId,originType:"AR",'meta.updatedAt':{$gte: f, $lt: e}}).exec())  //18~19

        let toTheStore7 =
             Number(yield Face.count({mobile: {$exists: true}, clientId: clientId,originType:"AR",'meta.updatedAt':{$gte: g, $lt: f}}).exec()) //18~19
            +Number(yield Skin.count({mobile: {$exists: true}, clientId: clientId,originType:"AR",'meta.updatedAt':{$gte: g, $lt: f}}).exec()) //18~19
            +Number(yield StarTest.count({mobile: {$exists: true}, clientId: clientId,originType:"AR",'meta.updatedAt':{$gte: g, $lt: f}}).exec())  //18~19



        obj = {
            obj1: [{ time: new Date(toDay).format('yyyy/MM/dd'), facecount: faceCount1,skinCount:skinCount1,starCount:starCount1,toTheStore: toTheStore1,count:Number(faceCount1+skinCount1+starCount1)}],
            obj2: [{ time: new Date(b).format('yyyy/MM/dd'),     facecount: faceCount2,skinCount:skinCount2,starCount:starCount2,toTheStore: toTheStore2,count:Number(faceCount2+skinCount2+starCount2)}],
            obj3: [{ time: new Date(c).format('yyyy/MM/dd'),     facecount: faceCount3,skinCount:skinCount3,starCount:starCount3,toTheStore: toTheStore3,count:Number(faceCount3+skinCount3+starCount3)}],
            obj4: [{ time: new Date(d).format('yyyy/MM/dd'),     facecount: faceCount4,skinCount:skinCount4,starCount:starCount4,toTheStore: toTheStore4,count:Number(faceCount4+skinCount4+starCount4)}],
            obj5: [{ time: new Date(e).format('yyyy/MM/dd'),     facecount: faceCount5,skinCount:skinCount5,starCount:starCount5,toTheStore: toTheStore5,count:Number(faceCount5+skinCount5+starCount5)}],
            obj6: [{ time: new Date(f).format('yyyy/MM/dd'),     facecount: faceCount6,skinCount:skinCount6,starCount:starCount6,toTheStore: toTheStore6,count:Number(faceCount6+skinCount6+starCount6)}],
            obj7: [{ time: new Date(g).format('yyyy/MM/dd'),     facecount: faceCount7,skinCount:skinCount7,starCount:starCount7,toTheStore: toTheStore7,count:Number(faceCount7+skinCount7+starCount7)}],
        }
    }else{
        toDay = new Date(queryDate)
        var a = new Date(toDay.getTime() + oneDay)//19
        let faceCount1 = yield Face.count({mobile: {$exists: true}, clientId: clientId ,'meta.updatedAt':{$gte: toDay.getTime(), $lt: a.getTime()}}).exec()  //18~19
        let skinCount1 = yield Skin.count({mobile: {$exists: true}, clientId: clientId ,'meta.updatedAt':{$gte: toDay.getTime(), $lt: a.getTime()}}).exec()  //18~19
        let starCount1 = yield StarTest.count({mobile: {$exists: true}, clientId: clientId ,'meta.updatedAt':{$gte: toDay.getTime(), $lt: a.getTime()}}).exec()
        let toTheStore1 =
            Number(yield Face.count({mobile: {$exists: true}, clientId: clientId,originType:"AR",'meta.updatedAt':{$gte: toDay.getTime(), $lt: a.getTime()}}).exec())
            +Number(yield Skin.count({mobile: {$exists: true}, clientId: clientId,originType:"AR",'meta.updatedAt':{$gte: toDay.getTime(), $lt: a.getTime()}}).exec())
            +Number(yield StarTest.count({mobile: {$exists: true}, clientId: clientId,originType:"AR",'meta.updatedAt':{$gte: toDay.getTime(), $lt: a.getTime()}}).exec())
        obj = {
            obj1: [{ time: toDay.format('yyyy/MM/dd'), facecount: faceCount1,skinCount:skinCount1,starCount:starCount1,toTheStore: toTheStore1,count:Number(faceCount1+skinCount1+starCount1)}]
        }
    }

    this.body = {
        code: 1,
        err: "OK",
        obj:obj
    }
}






Date.prototype.format = function(format) {
    var o = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "h+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        "S": this.getMilliseconds()
    }
    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
        }
    }
    return format;
}


/**
 * @api {get} /addAdvertisement  添加广告
 * @apiName addAdvertisement
 * @apiGroup AD
 * @apiPermission Client
 *
 * @apiDescription  系统管理员或者店长添加广告
 *
 * @apiParam {String} adType 广告类型
 * @apiParam {String} videoUrl 视频广告链接地址
 * @apiParam {String} preImg 视频预览图链接地址
 * @apiParam {String} imgUrl 图片广告链接地址
 * @apiParam {String} des 广告描述
 * @apiParam {String} area 区域
 * @apiParam {String} adUrl 广告跳转地址
 *
 * @apiExample Example usage:
 * http://test.legle.cc:82/addAdvertisement
 *
 * @apiSuccess {Number}   code   1.
 * @apiSuccess {String}   err 'ok'.
 *
 * @apiError code 0.
 * @apiError err   err message.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *       "code": 0
 *       "error": "user not found"
 *     }
 */
exports.addAdvertisement = function *(next) {

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      

  const advertisement = new Advertisement()

  if(this.session.client) {
    advertisement.clientId = this.session.client.clientId
  }

  if(this.session.sysMember) {
    advertisement.sysMemberId = this.session.sysMember.sysMemberId
  }

  let bodyKeys = Object.keys(this.request.body)

  for(let i = 0;i < bodyKeys.length;i++){
    let key = this.request.body[bodyKeys[i]]
    if(bodyKeys[i] !== '_id'){
      advertisement[bodyKeys[i]] = key
    }
  }

  yield advertisement.save()
  this.body = {
      code: 1,
      err: "添加广告成功"
  }
}

/**
 * @api {get} /editAdvertisement  编辑
 * @apiName editAdvertisement
 * @apiGroup AD
 * @apiPermission Client
 *
 * @apiDescription  系统管理员或者店长根据广告id编辑广告
 *
 * @apiParam {String} _id 广告的objectId
 * @apiParam {String} adType 广告类型
 * @apiParam {String} videoUrl 视频广告链接地址
 * @apiParam {String} preImg 视频预览图链接地址
 * @apiParam {String} imgUrl 图片广告链接地址
 * @apiParam {String} imgArr 图片广告轮播图
 * @apiParam {String} des 广告描述
 * @apiParam {String} area 区域
 * @apiParam {String} adUrl 广告跳转地址
 *
 * @apiExample Example usage:
 * http://test.legle.cc:82/editAdvertisement
 *
 * @apiSuccess {Number}   code   1.
 * @apiSuccess {String}   err 'ok'.
 *
 * @apiError code 0.
 * @apiError err   err message.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *       "code": 0
 *       "error": "user not found"
 *     }
 */
exports.editAdvertisement = function *(next) {

  if(!this.session.sysMember && !this.session.client){
      return (
          this.body = {
              code: 0,
              err: "用户没有登录，请登录"
          }
      )
  }

  let advertisement = yield Advertisement.findOne({_id: this.request.body._id}).exec()

  if(!advertisement) {
    return (
        this.body = {
            code: 0,
            err: "广告不存在"
        }
    )
  }


  let bodyKeys = Object.keys(this.request.body)

  for(let i = 0;i < bodyKeys.length;i++){
    let key = this.request.body[bodyKeys[i]]
    if(bodyKeys[i] !== '_id'){
      advertisement[bodyKeys[i]] = key
    }
  }

  yield advertisement.save()
  this.body = {
      code: 1,
      err: "编辑广告成功"
  }
}

var editRoll = function(roll) {

  if(roll && roll.length > 0) {
    for (var i = roll.length - 1; i >= 0; i--) {
      roll[i] = config.aliyun.ossHost + '/' + roll[i]
    }
  }

  return roll

}


/**
 * @api {get} /getAdvertisementList  Client  get Advertisement List
 * @apiName addAdvertisement
 * @apiGroup AD
 * @apiPermission Client
 *
 * @apiDescription  get Advertisement List

 * @apiSuccess {Number}   code   1.
 * @apiSuccess {String}   err 'ok'.
 *
 * @apiError code 0.
 * @apiError err   err message.
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *       "code": 0
 *       "error": "user not found"
 *     }
 */
exports.getAdvertisementList = function *(next) {
    if(!this.session.sysMember && !this.session.client){
      return (
          this.body = {
              code: 0,
              err: "用户没有登录，请登录"
          }
      )
  }
    
    
    let content = this.query.content || ''
    let number = this.query.pageNumber || 1
    let skip = (number - 1) * 10
    let query = {}
    if(this.session.sysMember){
      query.sysMemberId = this.session.sysMember.sysMemberId
    }else if(this.session.client){
      query.cilentId = this.session.client.clientId
    }
    console.log("this.session.sysMember",this.session.sysMember)
    console.log("this.session.client",this.session.client)
    let results
    if(content){
      query._id = content
      results = yield Advertisement.find(query).sort({'meta.createdAt': -1}).exec()
    }else{
      results = yield Advertisement.find(query).sort({'meta.createdAt': -1}).skip(skip).limit(10).exec()
    }
    let recordTotal = yield Advertisement.count(query).exec()


    this.body = {
        code: 1,
        err: "OK",
        results:results,
        recordTotal:recordTotal
    }
}

/**
 * @api {get} /getAdvertisements  Client  get Advertisement List
 * @apiName addAdvertisement
 * @apiGroup AD
 * @apiPermission Client
 *
 * @apiDescription  get Advertisement List

 * @apiSuccess {Number}   code   1.
 * @apiSuccess {String}   err 'ok'.
 *
 * @apiError code 0.
 * @apiError err   err message.
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *       "code": 0
 *       "error": "user not found"
 *     }
 */
exports.getAdvertisements = function *(next) {
    
    let results = yield Advertisement.find().sort({'meta.createdAt': -1}).exec()
    // let recordTotal = yield Advertisement.count(query).exec()


    this.body = {
        code: 1,
        err: "OK",
        results:results
        // recordTotal:recordTotal
    }
}


/**
 * @api {get} /deleteAdvertisement  删除广告
 * @apiName Client  delete Advertisement
 * @apiGroup AD
 * @apiPermission Client
 *
 * @apiDescription 系统管理员或者店长删除广告
 *
 * @apiParam {String} _id 广告ID
 *
 * @apiSuccess {Number}   code   1.
 * @apiSuccess {String}   err 'ok'.
 *
 * @apiError code 0.
 * @apiError err   err message.
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *       "code": 0
 *       "error": "user not found"
 *     }
 */
exports.deleteAdvertisement = function *(next) {
    let _id =  this.request.query._id
    if(!this.session.client && !this.session.sysMember) {
        return (this.body = {
            code: 0,
            err: "用户未登录，请登录"
        })
    }
    if(!_id) {
        return (this.body = {
            code: 0,
            err: "该数据不存在"
        })
    }
    yield Advertisement.remove({_id: _id}).exec()
    this.body = {
        code: 1,
        err: "删除成功"
    }
}



/**
 * @api {get} /pcAds 广告机获取所有广告
 * @apiName Client  get ads
 * @apiGroup AD
 * @apiPermission Client
 *
 * @apiDescription 广告机获取所有广告
 *
 * @apiParam {String} toolId The tool  _Id
 *
 * @apiSuccess {Number}   code   1.
 * @apiSuccess {String}   err 'ok'.
 *
 * @apiError code 0.
 * @apiError err   err message.
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *       "code": 0
 *       "clientAds": [{...}]
 *       "sysAds": [{...}]
 *     }
 */
exports.pcAds = function *(next) {
    // if(!this.session.client) {
    //     return (this.body = {
    //         code: 0,
    //         err: '店长未登录，请登录'
    //     })
    // }
    // let clientId =  this.session.client.clientId
    // let clientAds = yield Advertisement.find({clientId: clientId}).exec()
    let clientAds = yield Advertisement.find().exec()
    let sysAds = yield Advertisement.find({sysMemberId: {$exists: true}}).exec()


    this.body = {
        code: 1,
        clientAds: clientAds,
        sysAds:sysAds
    }
}


/**
 * @api {get} /clientAds 店长获取广告列表
 * @apiName clientAds
 * @apiGroup AD
 * @apiPermission Client
 *
 * @apiDescription 店长获取广告列表
 *
 *
 * @apiSuccess {Number}   code   1.
 * @apiSuccess {String}   err 'ok'.
 *
 * @apiError code 0.
 * @apiError err   err message.
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *       "code": 0
 *       "clientAds": [{...}]
 *     }
 */
exports.clientAds = function *(next) {
    if(!this.session.client) {
        return (this.body = {
            code: 0,
            err: '店长未登录，请登录'
        })
    }
    let clientId =  this.session.client.clientId
    let clientAds = yield Advertisement.find({clientId: clientId}).exec()


    this.body = {
        code: 1,
        clientAds: clientAds
    }
}

/**
 * @api {get} /sysAds 系统管理员获取广告列表
 * @apiName sysAds
 * @apiGroup AD
 * @apiPermission Client
 *
 * @apiDescription 系统管理员获取广告列表
 *
 *
 * @apiSuccess {Number}   code   1.
 * @apiSuccess {String}   err 'ok'.
 *
 * @apiError code 0.
 * @apiError err   err message.
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *       "code": 0
 *       "sysAds": [{...}]
 *     }
 */
exports.sysAds = function *(next) {
    if(!this.session.sysMember) {
        return (this.body = {
            code: 0,
            err: '未登录'
        })
    }
    let sysAds = yield Advertisement.find({sysMemberId: {$exists: true}}).exec()

    this.body = {
        code: 1,
        sysAds: sysAds
    }
}


/**
 * @api {get} /addTemplate  添加模板
 * @apiName addTenplate
 * @apiGroup template
 * @apiPermission Client
 *
 * @apiDescription  系统管理员或者店长添加模板
 *
 * @apiParam {String} adType 模板类型
 * @apiParam {String} topImg 上部分图片
 * @apiParam {String} coupons 优惠券
 * @apiParam {String} product 推荐产品
 *
 * @apiExample Example usage:
 * http://test.legle.cc:82/addTemplate
 *
 * @apiSuccess {Number}   code   1.
 * @apiSuccess {String}   err 'ok'.
 *
 * @apiError code 0.
 * @apiError err   err message.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *       "code": 0
 *       "error": "user not found"
 *     }
 */
exports.addTemplate = function *(next) {
  
  if(!this.session.sysMember && !this.session.client){
      return (
          this.body = {
              code: 0,
              err: "用户没有登录，请登录"
          }
      )
  }

  const template = new Template()

  if(this.session.client) {
    template.clientId = this.session.client.clientId
  }

  if(this.session.sysMember) {
    template.sysMemberId = this.session.sysMember.sysMemberId
  }

  let bodyKeys = Object.keys(this.request.body)

  for(let i = 0;i < bodyKeys.length;i++){
    let value = this.request.body[bodyKeys[i]]
      template[bodyKeys[i]] = value
  }

  yield template.save()
  this.body = {
      code: 1,
      err: "添加模板成功"
  }
}


/**
 * @api {get} /getTemplate  Client  getTemplate
 * @apiName getTemplate
 * @apiGroup template
 * @apiPermission Client
 *
 * @apiDescription  getTemplate

 * @apiSuccess {Number}   code   1.
 * @apiSuccess {String}   err 'ok'.
 *
 * @apiError code 0.
 * @apiError err   err message.
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *       "code": 0
 *       "error": "user not found"
 *     }
 */
exports.getTemplate = function *(next) {
    if(!this.session.sysMember && !this.session.client){
      return (
          this.body = {
              code: 0,
              err: "用户没有登录，请登录"
          }
      )
  }
    
    
    let content = this.query.content || ''
    let number = this.query.pageNumber || 1
    let skip = (number - 1) * 10
    let query = {}
    if(this.session.sysMember){
      query.sysMemberId = this.session.sysMember.sysMemberId
    }else if(this.session.client){
      query.clientId = this.session.client.clientId
    }
    let results
    if(content){
      query._id = content
      results = yield Template.find(query).sort({'meta.createdAt': -1}).exec()
    }else{
      results = yield Template.find(query).sort({'meta.createdAt': -1}).skip(skip).limit(10).exec()
    }
    let recordTotal = yield Template.count(query).exec()
    this.body = {
        code: 1,
        err: "OK",
        results:results,
        recordTotal:recordTotal
    }
}

/**
 * @api {get} /deleteTemplate  删除模板
 * @apiName Client  delete deleteTemplate
 * @apiGroup AD
 * @apiPermission Client
 *
 * @apiDescription 系统管理员或者店长删除模板
 *
 * @apiParam {String} _id 广告ID
 *
 * @apiSuccess {Number}   code   1.
 * @apiSuccess {String}   err 'ok'.
 *
 * @apiError code 0.
 * @apiError err   err message.
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     { 
 *       "code": 0
 *       "error": "user not found"
 *     }
 */
exports.deleteTemplate = function *(next) {
    let _id =  this.request.query._id
    if(!this.session.client && !this.session.sysMember) {
        return (this.body = {
            code: 0,
            err: "用户未登录，请登录"
        })
    }
    if(!_id) {
        return (this.body = {
            code: 0,
            err: "该数据不存在"
        })
    }
    let del = yield Template.remove({_id: _id}).exec()
    if(del){
      return this.body = {
        code: 0,
        err: "找不到该数据"
    }
    }
    this.body = {
        code: 1,
        err: "删除成功"
    }
}



/**
 * @api {post} /addCarousel  店主添加轮播图
 * @apiName addCarousel
 * @apiGroup Client
 * @apiPermission Client
 *
 * @apiDescription  店主添加轮播图
 *
 * @apiParam {String} img 轮播图地址
 *
 * @apiExample Example usage:
 * http://azz.legle.cc/addCarousel
 *
 * @apiSuccess {Number}   code   1.
 * @apiSuccess {String}   err 'ok'.
 *
 * @apiError code 0.
 * @apiError err   err message.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *       "code": 0
 *       "error": "user not found"
 *     }
 */
exports.addCarousel = function *(next) {
    if(!this.session.client) {
        return (
            this.body = {
                code: 0,
                err: '用户没有登录，请登录'
            }
        )
    }
    let clientId =  this.session.client.clientId || ''
    let body =  this.request.body


    console.log('body======', body)

    let client = yield Client.findOne({_id: clientId}).exec()
    
    
    console.log('client======', client)


    client.carousel = body
    

    client.markModified('carousel')
    yield client.save()
    
    this.body = {
        code: 1,
        err: '添加轮播图成功'
    }
}


/**
 * @api {get} /getCarousel  店主获取轮播图
 * @apiName getCarousel
 * @apiGroup Client
 * @apiPermission Client
 *
 * @apiDescription  店主获取轮播图
 *
 * @apiExample Example usage:
 * http://azz.legle.cc/getCarousel
 *
 * @apiSuccess {Number}   code   1.
 * @apiSuccess {String}   err 'ok'.
 *
 * @apiError code 0.
 * @apiError err   err message.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *       "code": 0
 *       "error": "user not found"
 *     }
 */
exports.getCarousel = function *(next) {
    
    
    

if(!this.session.client){
            return this.body = {
            code: 0,
            err: "请登录"
        }
    }


    let clientId =  this.session.client.clientId || ''
    console.log(clientId)
    if(!clientId){
            return this.body = {
            code: 0,
            err: "no clientId"
        }
    }
    let client = yield Client.findOne({_id: clientId}).exec()
    let carousel

    if(client.carousel) {
      carousel = client.carousel 
    }

    this.body = {
        code: 1,
        carousel: carousel || []
    }
}

/**
 * @api {get} /deleteCarousel  轮播图
 * @apiName Client  delete Carousel
 * @apiGroup AD
 * @apiPermission Client
 *
 * @apiDescription 系统管理员或者店长轮播图
 *
 * @apiParam {String} _id 轮播图ID
 *
 * @apiSuccess {Number}   code   1.
 * @apiSuccess {String}   err 'ok'.
 *
 * @apiError code 0.
 * @apiError err   err message.
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *       "code": 0
 *       "error": "user not found"
 *     }
 */
exports.deleteCarousel = function *(next) {
    let _id =  this.request.query._id
    if(!this.session.client && !this.session.sysMember) {
        return (this.body = {
            code: 0,
            err: "用户未登录，请登录"
        })
    }
    let clientId =  this.session.client.clientId || ''
    let client = yield Client.findOne({_id: clientId}).exec()
    console.log(client.carousel)
    client.carousel = []
    client.markModified('carousel')
    yield client.save()
    this.body = {
        code: 1,
        err: "删除成功"
    }
}


exports.getLoginState = function *(next) {
    
    if(!this.session.client) {
        return (this.body = {
            code: 0,
            err: "用户未登录，请登录"
        })
    }
    
    this.body = {
        code: 1,
        err: "ok"
    }
}
