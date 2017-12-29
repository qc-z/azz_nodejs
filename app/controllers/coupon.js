'use strict'

const mongoose = require('mongoose')
const Coupon = mongoose.model('Coupon')
const Game = mongoose.model('Game')
const config = require('../../config/config')


exports.test = function *(next) {
  this.body = {
      ret: 0,
      err: '待开发'
    }
}

/**
 * @api {post} /addCoupon   添加优惠券
 * @apiName addCoupon
 * @apiGroup Coupon
 * @apiPermission anyBody
 *
 * @apiDescription addCoupon
 *
 * @apiParam {String} area 区域：比如广州天河区
 * @apiParam {String} title 标题：玻尿酸隆鼻8折
 * @apiParam {String} des 描述
 * @apiParam {String} img 展示图片
 * @apiParam {String} category 类别：A,B,C,D
 * @apiParam {String} prob 中奖概率：60 代表 60%；20 代表 20%
 *
 * @apiExample Example usage:
 * http://test.legle.cc:82/addCoupon
 *
 * @apiSuccess {Number}   ret   1.
 * @apiSuccess {String}   err 'ok'.
 * @apiError ret 0.
 * @apiError err   err message.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *       "ret": 0
 *       "err": 0
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

  let couponExist = yield Coupon.findOne({title: title}).exec()

  if(couponExist) {
    return (this.body = {
      ret: 0,
      err: '该类目已存在'
    })
  }

  let bodykeys = Object.keys(body)

  let id = body.id || Math.random().toString(36).substring(3, 11)

  let _coupon = new Coupon({id: id})

  if(bodykeys.length > 0) {
    for (let i = bodykeys.length - 1; i >= 0; i--) {
      _coupon[bodykeys[i]] = body[bodykeys[i]]
    }
    yield _coupon.save()
  }

  this.body = {
    ret: 1,
    coupon: _coupon,
    err: 'ok'
  }
}


/**
 * @api {post} /editCoupon  编辑优惠券
 * @apiName editCoupon
 * @apiGroup Coupon
 * @apiPermission anyBody
 *
 * @apiDescription editCoupon
 *
 * @apiParam {String} area 区域：比如广州天河区
 * @apiParam {String} title 标题：玻尿酸隆鼻8折
 * @apiParam {String} des 描述
 * @apiParam {String} img 展示图片
 * @apiParam {String} category 类别：A,B,C,D
 * @apiParam {String} prob 中奖概率：60 代表 60%；20 代表 20%
 *
 * @apiExample Example usage:
 * http://test.legle.cc:82/editCoupon
 *
 * @apiSuccess {Number}   ret   1.
 * @apiSuccess {String}   err 'ok'.
 * @apiError ret 0.
 * @apiError err   err message.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *       "ret": 0
 *       "err": ''
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

  let _coupon = yield Coupon.findOne({id: id}).exec()


  if(bodykeys.length > 0 && _coupon) {
    for (let i = bodykeys.length - 1; i >= 0; i--) {
      if(body[bodykeys[i]]) {
        _coupon[bodykeys[i]] = body[bodykeys[i]]
      }
    }
    yield _coupon.save()
  }

  this.body = {
    ret: 1,
    coupon: _coupon,
    err: 'ok'
  }
}


/**
 * @api {post} /delCoupon  删除优惠券
 * @apiName delCoupon
 * @apiGroup Coupon
 * @apiPermission anyBody
 *
 * @apiDescription delCoupon
 *
 * @apiParam {String} _id 项目id

 *
 * @apiExample Example usage:
 * http://test.legle.cc:82/delCoupon
 *
 * @apiSuccess {Number}   ret   1.
 * @apiSuccess {String}   err 'ok'.
 * @apiError ret 0.
 * @apiError err   err message.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *       "ret": 0
 *       "err": 0
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

  let _coupon = yield Coupon.findOne({title: title}).exec()

  if(!_coupon) {
    return (this.body = {
      ret: 0,
      err: '该数据不存在'
    })
  }
  yield _coupon.remove()

  this.body = {
    ret: 1,
    err: 'ok'
  }
}


/**
 * @api {get} /getCoupon  获取优惠券
 * @apiName getCoupon
 * @apiGroup Coupon
 * @apiPermission anyBody
 *
 * @apiDescription getCoupon
 *
 *
 * @apiExample Example usage:
 * http://test.legle.cc:82/getCoupon
 *
 * @apiSuccess {Number}   ret   1.
 * @apiSuccess {String}   err 'ok'.
 * @apiError ret 0.
 * @apiError err   err message.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *       "ret": 0
 *       "err": 0
 *     }
 */
exports.info = function *(next) {

  console.log(this.query)
  // p
  let content = this.query.content || ''
  let number = this.query.pageNumber || 1
  let skip = (number - 1) * 10
  let query = {}
  let coupons
  if(content){
    query.title = content
    coupons = yield Coupon.find(query).exec()
  }else{
    coupons = yield Coupon.find(query).sort({'meta.createdAt': -1}).skip(skip).limit(10).exec()
  }
  let recordTotal = yield Coupon.count(query).exec()
  this.body = {
    ret: 1,
    coupons: coupons,
    recordTotal: recordTotal,
    err: 'ok'
  }

}

/**
 * @api {get} /coupons  客户端获取优惠券
 * @apiName coupons
 * @apiGroup Coupon
 * @apiPermission anyBody
 *
 * @apiDescription coupons
 *
 * @apiParam {String} title 根据title 来添加
 *
 * @apiExample Example usage:
 * http://test.legle.cc:82/coupons
 *
 * @apiSuccess {Number}   ret   1.
 * @apiSuccess {String}   err 'ok'.
 * @apiError ret 0.
 * @apiError err   err message.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *       "ret": 0
 *       "err": 0
 *     }
 */
exports.coupons = function *(next) {

  console.log(this.query)
  // p
  let title = this.query.title || ''
  let number = this.query.pageNumber || 1
  let skip = (number - 1) * 10
  let query = {}
  let coupons
  // let parts
  if(title){
    query.title = title
    coupons = yield Coupon.find(query).exec()
  }else{
    coupons = yield Coupon.find(query).sort({'meta.createdAt': -1}).skip(skip).limit(10).exec()
  }
  let recordTotal = yield Coupon.count(query).exec()

  // // 去重
  // if(coupons) {
  //   let temp = []
  //   for (let i = 0; i < coupons.length; i++) {
  //     temp.push(coupons[i].part)
  //   }
  //   parts = [...new Set(temp)]
  // }

  this.body = {
    ret: 1,
    // parts: parts,
    coupons: coupons,
    recordTotal: recordTotal,
    err: 'ok'
  }

}

/**
 * @api {get} /win  客户端抽奖获取优惠券
 * @apiName win
 * @apiGroup Coupon
 * @apiPermission anyBody
 *
 * @apiDescription win
 *
 * @apiExample Example usage:
 * http://test.legle.cc:82/win
 *
 * @apiSuccess {Number}   ret   1.
 * @apiSuccess {String}   err 'ok'.
 * @apiError ret 0.
 * @apiError err   err message.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *       "ret": 0
 *       "err": 0
 *     }
 */
exports.win = function *(next) {

  let probs = []

  let coupons = yield Coupon.find().exec()

  if(coupons) {
    for (let i = 0; i < coupons.length; i++) {
      probs.push(coupons[i].prob)
    }
  }
  else {
    return (this.body = {
      ret: 0,
      err: '没有优惠券'
    })
  }


  let total = 0

  for (let i = 0; i < probs.length; i++) {
    total += probs[i]
  }
  
  let remain = 100 - total > 0 ? 100 - total : 0

  total += remain

  probs.push(remain)


  // 各类所占百分比
  let rates = []
  for (let i = 0; i < probs.length; i++) {
    rates.push(probs[i]/total*100)
  }


  // 按概率出值
  let win
  let random = Math.random() * 100
  for (let i = 0; i < rates.length; i++) {
    if(i == 0) {
      if(random < rates[0]) {
        win = coupons[i] || ''
      }
    }
    else {
      let a = i + 1
      let ii = 0
      let aa = 0
      for (let x = 0; x < i; x++) {
        ii += rates[x]
      }
      for (let y = 0; y < a; y++) {
        aa += rates[y]
      }
      if(ii <= random  && random < aa) {
        win = coupons[i] || ''
      }
    }
  }
 

  this.body = {
    ret: 1,
    win: win,
    err: 'ok'
  }

}

/**
 * @api {post} /couponMobile   用户通过手机验证优惠券状态
 * @apiName couponMobile
 * @apiGroup Coupon
 * @apiPermission anyBody
 *
 * @apiDescription 用户输入手机，并且通过该手机号码领取优惠券
 *
 * @apiParam {String} mobile 手机号码.
 * @apiParam {String} couponid 优惠券 id
 *
 * @apiExample Example usage:
 * http://test.legle.cc:82/couponMobile
 *
 * @apiSuccess {Number}   ret   1.
 * @apiSuccess {String}   code   优惠码
 * @apiSuccess {String}   mobile 'yes'代表这个手机已经验证过，不用用户再输入验证码验证，'no'则反.
 * @apiSuccess {String}   sended 'yes'代表这个用户已经领取过优惠券，不能再次领取.
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
exports.couponMobile = function *(next) {

  let cookie = 'no'
  let sended = 'no'

  let mobile = this.request.body.mobile
  let couponid = this.request.body.couponid

  let code = Math.random().toString(36).substring(3, 7)

  if(!mobile || !couponid || !code) {
    return (this.body = {
      ret: 0,
      err: '缺少参数'
    })
  }

  if(this.session.test && mobile == this.session.test.mobile) {
    cookie = 'yes'
  }

  let red = yield Game.findOne({mobile: mobile, category: 'coupon'}).exec()

  if(red && red.done == 'yes') {
    sended = 'yes'
  }
  else if(red && red.done == 'no' && red.code) {
    code = red.code
  }
  else if(!red) {
    let amount = 1 + Number(Math.random().toFixed(1))
    let coupon = new Game({
      mobile: mobile,
      gameid: couponid,
      code: code,
      category: 'coupon'
    })
    yield coupon.save()
  }


  this.body = {
    ret: 1,
    code: code,
    mobile: cookie,
    sended: sended
  }

}


/**
 * @api {post} /myCoupon   用户通过手机获取个人优惠券
 * @apiName myCoupon
 * @apiGroup Coupon
 * @apiPermission anyBody
 *
 * @apiDescription 用户输入手机，并且通过该手机获取个人优惠券
 *
 * @apiParam {String} mobile 手机号码
 *
 * @apiExample Example usage:
 * http://azz.legle.cc/myCoupon
 *
 * @apiSuccess {Number}   ret   1.
 * @apiSuccess {Array}   coupons   优惠码
 * @apiError ret 0.
 * @apiError err   err message.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *       "ret": 1
 *       "coupons": [{coupon},{coupon}]
 *     }
 */
exports.myCoupon = function *(next) {

  let openid = this.request.body.openid


  let games = yield Game.find({openid: openid, category: 'coupon', done: 'yes'}).exec()

  let coupons = []
  if(games) {
    for (let i = 0; i < games.length; i++) {
      let coupon = yield Coupon.findOne({id: games[i].gameid}).exec()
      if(coupon) {
        coupon.mobile = games[i].mobile
        coupons.push(coupon)
      }
    }
  }

  this.body = {
    ret: 1,
    coupons: coupons
  }

}

// 判断当前 openid 是否为本人 openid
exports.couponStatus = function *(next) {
  let openid = this.query.openid
  if(this.session && this.session.redPacket && this.session.redPacket.myOpenid) {
    let myOpenid = this.session.redPacket.myOpenid
    if(myOpenid == openid) {
      return (this.body = {
        ret: 1,
        myOpenid: myOpenid
      })
    }
  }

  this.body = {
    ret: 0
  }
}


// 获取本人openid 并且跳转
exports.wxcbCounpon = function *(next) {

  let id = ''
  if(this.session && this.session.passport && this.session.passport.user) {
    id = this.session.passport.user
  }

  this.session.redPacket = {
    myOpenid: id
  }

  let url = config.myCoupon + '?openid=' + id

  this.redirect(url)
}








