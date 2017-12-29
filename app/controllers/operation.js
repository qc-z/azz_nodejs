'use strict'

const mongoose = require('mongoose')
const Operation = mongoose.model('Operation')


/**
 * @api {post} /addOperation   添加百科项目
 * @apiName addOperation
 * @apiGroup sys
 * @apiPermission anyBody
 *
 * @apiDescription addOperation
 *
 * @apiParam {String} timeing 手术时长
 * @apiParam {String} treatment 疗程
 * @apiParam {String} cover 恢复时间
 * @apiParam {String} risk 风险
 * @apiParam {String} anesthesia 是否麻醉
 * @apiParam {String} inhospital 是否住院
 * @apiParam {String} name 项目名称
 * @apiParam {String} parentid 父项目 ID，如果有
 * @apiParam {String} price 价格.
 * @apiParam {String} time 持续时间.
 * @apiParam {String} method 美容方法.
 * @apiParam {String} introduction 简介.
 * @apiParam {String} effect 功效.
 * @apiParam {String} fitPeople 适合人群.
 * @apiParam {String} tabooPeople 禁忌人群.
 * @apiParam {String} advantage 优点.
 * @apiParam {String} weak 缺点.
 * @apiParam {String} other 其他.
 * @apiParam {String} treatProcess 治疗过程.
 * @apiParam {String} surgicalPre 手术前.
 * @apiParam {String} surgicalCare 手术注意事项.
 * @apiParam {Object} collationschematic [] 数组 对比图地址.
 * @apiParam {Object} operationProjectDatas 操作过程.
 * @apiParam {Object} schematicschematic 原理图.
 *
 * @apiExample Example usage:
 * http://test.legle.cc:82/addOperation
 *
 * @apiSuccess {Number}   code   1.
 * @apiSuccess {String}   err 'ok'.
 * @apiError code 0.
 * @apiError err   err message.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *       "code": 0
 *       "code": 0
 *     }
 */
exports.add = function *(next) {
  if(!this.session.sysMember) {
    return (this.body = {
      code: 0,
      err: '请先登录'
    })
  }
  
  // let clientId = this.session.client.clientId

  let body = this.request.body
  console.log('body',body)
  
  let bodykeys = Object.keys(body)
  let id = body.id || Math.random().toString(36).substring(3, 11)

  if(body.name == '眉毛'){
      id = '5tnd94ii'
  }else if(body.name == '鼻子'){  
      id = '48r59e80'
  }else if(body.name == '眼睛'){
      id = 'jr6j96ix'
  }else if(body.name == '脸'){
      id = '3tcwjvxo'
  }else if(body.name == '嘴巴'){
      id = 'dw9qxlc1'
  }else if(body.name == '下巴'){
      id = 'xiabac1'
  }else if(body.name == '耳朵'){
      id = 'erduolc1'
  }
  let operation = new Operation({id: id})

  if(bodykeys.length > 0) {
    for (var i = bodykeys.length - 1; i >= 0; i--) {
      operation[bodykeys[i]] = body[bodykeys[i]]
    }
    yield operation.save()
  }

  this.body = {
    code: 1,
    operation: operation,
    err: 'ok'
  }
}


/**
 * @api {post} /editOperation  编辑百科项目
 * @apiName editOperation
 * @apiGroup sys
 * @apiPermission anyBody
 *
 * @apiDescription editOperation
 *
 * @apiParam {String} name 项目名称
 * @apiParam {String} parentid 父项目 ID，如果有
 * @apiParam {String} price 价格.
 * @apiParam {String} time 持续时间.
 * @apiParam {String} method 美容方法.
 * @apiParam {String} introduction 简介.
 * @apiParam {String} effect 功效.
 * @apiParam {String} fitPeople 适合人群.
 * @apiParam {String} tabooPeople 禁忌人群.
 * @apiParam {String} advantage 优点.
 * @apiParam {String} weak 缺点.
 * @apiParam {String} other 其他.
 * @apiParam {String} treatProcess 治疗过程.
 * @apiParam {String} surgicalPre 手术前.
 * @apiParam {String} surgicalCare 手术注意事项.
 * @apiParam {Object} collationschematic [] 数组 对比图地址.
 * @apiParam {Object} operationProjectDatas 操作过程.
 * @apiParam {Object} schematicschematic 原理图.
 *
 * @apiExample Example usage:
 * http://test.legle.cc:82/editOperation
 *
 * @apiSuccess {Number}   code   1.
 * @apiSuccess {String}   err 'ok'.
 * @apiError code 0.
 * @apiError err   err message.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *       "code": 0
 *       "code": 0
 *     }
 */
exports.edit = function *(next) {

  if(!this.session.sysMember) {
    return (this.body = {
      code: 0,
      err: '请先登录'
    })
  }
  console.log(this.request.body)
  let body = this.request.body
  let bodykeys = Object.keys(body)

  let id = body.id

  let operation = yield Operation.findOne({id: id}).exec()


  if(bodykeys.length > 0 && operation) {
    for (var i = bodykeys.length - 1; i >= 0; i--) {
      if(bodykeys[i] == 'collationschematic' && body[bodykeys[i]] == '') {
        body[bodykeys[i]] = []
      }
      if(bodykeys[i] == 'schematicschematic' && body[bodykeys[i]] == '') {
        body[bodykeys[i]] = []
      }
      if(body[bodykeys[i]]) {
        operation[bodykeys[i]] = body[bodykeys[i]]
      }
    }
    yield operation.save()
  }

  this.body = {
    code: 1,
    operation: operation,
    err: 'ok'
  }
}


/**
 * @api {post} /delOperation  删除百科项目
 * @apiName delOperation
 * @apiGroup sys
 * @apiPermission anyBody
 *
 * @apiDescription delOperation
 *
 * @apiParam {String} id 项目id

 *
 * @apiExample Example usage:
 * http://test.legle.cc:82/delOperation
 *
 * @apiSuccess {Number}   code   1.
 * @apiSuccess {String}   err 'ok'.
 * @apiError code 0.
 * @apiError err   err message.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *       "code": 0
 *       "code": 0
 *     }
 */
exports.del = function *(next) {

  if(!this.session.sysMember) {
    return (this.body = {
      code: 0,
      err: '请先登录'
    })
  }
  // let clientId = this.session.client.clientId

  let id = this.request.body.id

  let operation = yield Operation.findOne({id: id}).exec()

  let childOperation = yield Operation.findOne({parentid: id}).exec()
  if(childOperation) {
    let childOperation2 = yield Operation.findOne({parentid: childOperation.id}).exec()
    if(childOperation2) {
      yield childOperation2.remove()
    }
    yield childOperation.remove()
  }
  yield operation.remove()

  this.body = {
    code: 1,
    err: 'ok'
  }
}


/**
 * @api {get} /getOperation  获取百科项目
 * @apiName getOperation
 * @apiGroup sys
 * @apiPermission anyBody
 *
 * @apiDescription getOperation
 *
 *
 * @apiExample Example usage:
 * http://test.legle.cc:82/getOperation
 *
 * @apiSuccess {Number}   code   1.
 * @apiSuccess {String}   err 'ok'.
 * @apiError code 0.
 * @apiError err   err message.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *       "code": 0
 *       "code": 0
 *     }
 */
exports.info = function *(next) {

  // if(!this.session.sysMember) {
  //   return (this.body = {
  //     code: 0,
  //     err: '请先登录'
  //   })
  // }
  let id = this.query.id
  let operations
  if(id){
    operations = yield Operation.findOne({id:id}).exec()
  }else{
    operations = yield Operation.find().exec()
  }
  

  this.body = {
    code: 1,
    operations: operations,
    err: 'ok'
  }
}

