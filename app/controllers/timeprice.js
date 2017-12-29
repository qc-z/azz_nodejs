'use strict'

const mongoose = require('mongoose')
const Timeprice = mongoose.model('Timeprice')


/**
 * @api {post} /addTimeprice   添加限时优惠项目
 * @apiName addTimeprice
 * @apiGroup Timeprice
 * @apiPermission anyBody
 *
 * @apiDescription addTimeprice
 *
 * @apiParam {String} price 实际价格
 * @apiParam {String} priceH 划掉价格
 * @apiParam {String} title 标题：玻尿酸隆鼻
 * @apiParam {String} des 描述
 * @apiParam {String} img 展示图
 *
 * @apiExample Example usage:
 * http://azz.legle.cc/addTimeprice
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
exports.add = function *(next) {

  if(!this.session.sysMember) {
    return (this.body = {
      ret: 0,
      err: '请先登录'
    })
  }

  // let clientId = this.session.client.clientId

  let body = this.request.body

  let title = body.title || ''

  let timepriceExist = yield Timeprice.findOne({title: title}).exec()

  if(timepriceExist) {
    return (this.body = {
      ret: 0,
      err: '该类目已存在'
    })
  }

  let bodykeys = Object.keys(body)

  let id = body.id || Math.random().toString(36).substring(3, 11)

  let _timeprice = new Timeprice({id: id})

  if(bodykeys.length > 0) {
    for (let i = bodykeys.length - 1; i >= 0; i--) {
      _timeprice[bodykeys[i]] = body[bodykeys[i]]
    }
    yield _timeprice.save()
  }

  this.body = {
    ret: 1,
    timeprice: _timeprice,
    err: 'ok'
  }
}


/**
 * @api {post} /editTimeprice  编辑限时优惠项目
 * @apiName editTimeprice
 * @apiGroup Timeprice
 * @apiPermission anyBody
 *
 * @apiDescription editTimeprice
 *
 * @apiParam {String} price 实际价格
 * @apiParam {String} priceH 划掉价格
 * @apiParam {String} title 标题：玻尿酸隆鼻
 * @apiParam {String} des 描述
 * @apiParam {String} img 展示图
 *
 * @apiExample Example usage:
 * http://azz.legle.cc/editTimeprice
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
exports.edit = function *(next) {

  if(!this.session.sysMember) {
    return (this.body = {
      ret: 0,
      err: '请先登录'
    })
  }

  let body = this.request.body
  let bodykeys = Object.keys(body)

  let id = body.id

  let _timeprice = yield Timeprice.findOne({id: id}).exec()


  if(bodykeys.length > 0 && _timeprice) {
    for (let i = bodykeys.length - 1; i >= 0; i--) {
      if(body[bodykeys[i]]) {
        _timeprice[bodykeys[i]] = body[bodykeys[i]]
      }
    }
    yield _timeprice.save()
  }

  this.body = {
    ret: 1,
    timeprice: _timeprice,
    err: 'ok'
  }
}


/**
 * @api {post} /delTimeprice  删除限时优惠项目
 * @apiName delTimeprice
 * @apiGroup Timeprice
 * @apiPermission anyBody
 *
 * @apiDescription delTimeprice
 *
 * @apiParam {String} _id 项目id

 *
 * @apiExample Example usage:
 * http://azz.legle.cc/delTimeprice
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
exports.del = function *(next) {

  if(!this.session.sysMember) {
    return (this.body = {
      ret: 0,
      err: '请先登录'
    })
  }
  // let clientId = this.session.client.clientId

  let title = this.request.body.title

  let _timeprice = yield Timeprice.findOne({title: title}).exec()

  if(!_timeprice) {
    return (this.body = {
      ret: 0,
      err: '该数据不存在'
    })
  }
  yield _timeprice.remove()

  this.body = {
    ret: 1,
    err: 'ok'
  }
}


/**
 * @api {get} /getTimeprice  获取限时优惠项目
 * @apiName getTimeprice
 * @apiGroup Timeprice
 * @apiPermission anyBody
 *
 * @apiDescription getTimeprice
 *
 *
 * @apiExample Example usage:
 * http://azz.legle.cc/getTimeprice
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
exports.info = function *(next) {

  console.log(this.query)
  // p
  let content = this.query.content || ''
  let number = this.query.pageNumber || 1
  let skip = (number - 1) * 10
  let query = {}
  let timeprices
  if(content){
    query.title = content
    timeprices = yield Timeprice.find(query).exec()
  }else{
    timeprices = yield Timeprice.find(query).sort({'meta.createdAt': -1}).skip(skip).limit(10).exec()
  }
  let recordTotal = yield Timeprice.count(query).exec()
  this.body = {
    ret: 1,
    timeprices: timeprices,
    recordTotal: recordTotal,
    err: 'ok'
  }

}

/**
 * @api {get} /timeprices  客户端获取限时优惠项目
 * @apiName timeprices
 * @apiGroup Timeprice
 * @apiPermission anyBody
 *
 * @apiDescription timeprices
 *
 * @apiParam {String} title 可选 根据title 来搜索
 *
 * @apiExample Example usage:
 * http://azz.legle.cc/timeprices
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
exports.timeprices = function *(next) {

  console.log(this.query)
  // p
  let title = this.query.title || ''
  let number = this.query.pageNumber || 1
  let skip = (number - 1) * 10
  let query = {}
  let timeprices
  if(title){
    query.title = title
    timeprices = yield Timeprice.find(query).exec()
  }else{
    timeprices = yield Timeprice.find(query).sort({'meta.createdAt': -1}).skip(skip).limit(10).exec()
  }
  let recordTotal = yield Timeprice.count(query).exec()

  this.body = {
    ret: 1,
    timeprices: timeprices,
    recordTotal: recordTotal,
    err: 'ok'
  }

}


/**
 * @api {post} /timepriceMobile   用户通过手机验证限时优惠券状态
 * @apiName timepriceMobile
 * @apiGroup Timeprice
 * @apiPermission anyBody
 *
 * @apiDescription 用户输入手机，并且通过该手机号码领取限时优惠券
 *
 * @apiParam {String} mobile 手机号码.
 * @apiParam {String} timepriceid 限时优惠券 id
 *
 * @apiExample Example usage:
 * http://azz.legle.cc/timepriceMobile
 *
 * @apiSuccess {Number}   ret   1.
 * @apiSuccess {String}   code   优惠码
 * @apiSuccess {String}   mobile 'yes'代表这个手机已经验证过，不用用户再输入验证码验证，'no'则反.
 * @apiSuccess {String}   sended 'yes'代表这个用户已经领取过限时优惠券，不能再次领取.
 * @apiError ret 0.
 * @apiError err   err message.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *       "ret": 1
 *       "code": ax23
 *       "mobile": no
 *       "sended": no
 *     }
 */
exports.timepriceMobile = function *(next) {

  let cookie = 'no'
  let sended = 'no'

  let mobile = this.request.body.mobile
  let timepriceid = this.request.body.timepriceid

  let code = Math.random().toString(36).substring(3, 8)

  if(!mobile || !timepriceid || !code) {
    return (this.body = {
      ret: 0,
      err: '缺少参数'
    })
  }

  if(this.session.test && mobile == this.session.test.mobile) {
    cookie = 'yes'
  }

  let red = yield Game.findOne({mobile: mobile, category: 'timeprice', gameid: timepriceid}).exec()

  if(red && red.done == 'yes') {
    sended = 'yes'
  }
  else if(red && red.done == 'no' && red.code) {
    code = red.code
  }
  else if(!red) {
    let amount = 1 + Number(Math.random().toFixed(1))
    let timeprice = new Game({
      mobile: mobile,
      gameid: timepriceid,
      code: code,
      category: 'timeprice'
    })
    yield timeprice.save()
  }

  console.log(code)

  this.body = {
    ret: 1,
    code: code,
    mobile: cookie,
    sended: sended
  }

}


