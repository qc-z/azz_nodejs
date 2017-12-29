'use strict'

const mongoose = require('mongoose')
const Price = mongoose.model('Price')


/**
 * @api {post} /addPrice   添加价格条目
 * @apiName addPrice
 * @apiGroup sys
 * @apiPermission anyBody
 *
 * @apiDescription addPrice
 *
 * @apiParam {String} name 项目名称
 * @apiParam {String} deal 成交价格
 * @apiParam {String} high 最高价格
 * @apiParam {String} low  最低价格
 * @apiParam {String} average 平均价格
 * @apiParam {String} region 地区
 *
 * @apiExample Example usage:
 * http://test.legle.cc:82/addPrice
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
  let bodykeys = Object.keys(body)

  let id = body.id || Math.random().toString(36).substring(3, 11)
  let find = yield Price.findOne({name: body.name}).exec()

  if(find) {
    return (this.body = {
      ret: 0,
      err: '该版本已存在'
    })
  }
  let price = new Price({id: id})
  
  if(bodykeys.length > 0) {
    for (var i = bodykeys.length - 1; i >= 0; i--) {
      price[bodykeys[i]] = body[bodykeys[i]]
    }
    yield price.save()
  }

  this.body = {
    code: 1,
    price: price,
    err: 'ok'
  }
}


/**
 * @api {post} /editPrice  编辑价格条目
 * @apiName editPrice
 * @apiGroup sys
 * @apiPermission anyBody
 *
 * @apiDescription editPrice
 *
 * @apiParam {String} name 项目名称
 * @apiParam {String} deal 成交价格
 * @apiParam {String} high 最高价格
 * @apiParam {String} low  最低价格
 * @apiParam {String} average 平均价格
 * @apiParam {String} region 地区
 *
 * @apiExample Example usage:
 * http://test.legle.cc:82/editPrice
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
// exports.edit = function *(next) {

//   if(!this.session.sysMember) {
//     return (this.body = {
//       ret: 0,
//       err: '请先登录'
//     })
//   }

//   let body = this.request.body
//   let bodykeys = Object.keys(body)

//   let id = body.id

//   let price = yield Price.findOne({id: id}).exec()


//   if(bodykeys.length > 0 && price) {
//     for (var i = bodykeys.length - 1; i >= 0; i--) {
//       if(bodykeys[i] == 'collationschematic' && body[bodykeys[i]] == '') {
//         body[bodykeys[i]] = []
//       }
//       if(bodykeys[i] == 'schematicschematic' && body[bodykeys[i]] == '') {
//         body[bodykeys[i]] = []
//       }
//       if(body[bodykeys[i]]) {
//         price[bodykeys[i]] = body[bodykeys[i]]
//       }
//     }
//     yield price.save()
//   }

//   this.body = {
//     code: 1,
//     price: price,
//     err: 'ok'
//   }
// }


/**
 * @api {post} /delPrice  删除价格条目
 * @apiName delPrice
 * @apiGroup sys
 * @apiPermission anyBody
 *
 * @apiDescription delPrice
 *
 * @apiParam {String} id 项目id

 *
 * @apiExample Example usage:
 * http://test.legle.cc:82/delPrice
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

  let id = this.request.body.id

  let price = yield Price.findOne({id: id}).exec()

  yield price.remove()

  this.body = {
    code: 1,
    err: 'ok'
  }
}


/**
 * @api {get} /getPrice  获取价格项目
 * @apiName getPrice
 * @apiGroup sys
 * @apiPermission anyBody
 *
 * @apiDescription getPrice
 *
 *
 * @apiExample Example usage:
 * http://test.legle.cc:82/getPrice
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
  let prices
  if(content){
    query.name = content
    prices = yield Price.find(query).exec()
  }else{
    prices = yield Price.find(query).sort({'meta.createdAt': -1}).skip(skip).limit(10).exec()
  }
  let recordTotal = yield Price.count(query).exec()
  this.body = {
    code: 1,
    prices: prices,
    recordTotal: recordTotal,
    err: 'ok'
  }
}

exports.edit = function *(next) {
  let name = this.request.body.name || ''
  let action = this.request.body.action || ''
  let price = yield Price.findOne({name: name}).exec()
  let bodyKeys = Object.keys(this.request.body)
  if(!price) {
    return (this.body = {
      ret: 0,
      err: '该项目不存在'
    })
  }

  if(action === 'delete') {
    yield price.remove()
    return (this.body = {
      ret: 2,
      msg: 'ok'
    })
  }

  for(let i = 0;i < bodyKeys.length;i++){
    let key = this.request.body[bodyKeys[i]]
    if(bodyKeys[i] !== 'name' && bodyKeys[i] !=='action'){
      price[bodyKeys[i]] = key
    }
  }
  yield price.save()

  this.body = {
    ret: 1,
    msg: 'ok'
  }

}
