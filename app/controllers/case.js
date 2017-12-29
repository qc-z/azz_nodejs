'use strict'

const mongoose = require('mongoose')
const Case = mongoose.model('Case')


/**
 * @api {post} /addCase   添加案例项目
 * @apiName addCase
 * @apiGroup Case
 * @apiPermission anyBody
 *
 * @apiDescription addCase
 *
 * @apiParam {String} part 部位：比如鼻子
 * @apiParam {String} title 标题：玻尿酸隆鼻
 * @apiParam {String} des 描述
 * @apiParam {String} before 术前图
 * @apiParam {String} after 术后图
 *
 * @apiExample Example usage:
 * http://test.legle.cc:82/addCase
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

  let caseExist = yield Case.findOne({title: title}).exec()

  if(caseExist) {
    return (this.body = {
      ret: 0,
      err: '该类目已存在'
    })
  }

  let bodykeys = Object.keys(body)

  let id = body.id || Math.random().toString(36).substring(3, 11)

  let _case = new Case({id: id})

  if(bodykeys.length > 0) {
    for (let i = bodykeys.length - 1; i >= 0; i--) {
      _case[bodykeys[i]] = body[bodykeys[i]]
    }
    yield _case.save()
  }

  this.body = {
    ret: 1,
    case: _case,
    err: 'ok'
  }
}


/**
 * @api {post} /editCase  编辑案例项目
 * @apiName editCase
 * @apiGroup Case
 * @apiPermission anyBody
 *
 * @apiDescription editCase
 *
 * @apiParam {String} _id 项目id
 * @apiParam {String} part 部位：比如鼻子
 * @apiParam {String} title 标题：玻尿酸隆鼻
 * @apiParam {String} des 描述
 * @apiParam {String} before 术前图
 * @apiParam {String} after 术后图
 *
 * @apiExample Example usage:
 * http://test.legle.cc:82/editCase
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

  let _case = yield Case.findOne({id: id}).exec()


  if(bodykeys.length > 0 && _case) {
    for (let i = bodykeys.length - 1; i >= 0; i--) {
      if(body[bodykeys[i]]) {
        _case[bodykeys[i]] = body[bodykeys[i]]
      }
    }
    yield _case.save()
  }

  this.body = {
    ret: 1,
    case: _case,
    err: 'ok'
  }
}


/**
 * @api {post} /delCase  删除案例项目
 * @apiName delCase
 * @apiGroup Case
 * @apiPermission anyBody
 *
 * @apiDescription delCase
 *
 * @apiParam {String} _id 项目id

 *
 * @apiExample Example usage:
 * http://test.legle.cc:82/delCase
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

  let _case = yield Case.findOne({title: title}).exec()

  if(!_case) {
    return (this.body = {
      ret: 0,
      err: '该数据不存在'
    })
  }
  yield _case.remove()

  this.body = {
    ret: 1,
    err: 'ok'
  }
}


/**
 * @api {get} /getCase  获取案例项目
 * @apiName getCase
 * @apiGroup Case
 * @apiPermission anyBody
 *
 * @apiDescription getCase
 *
 *
 * @apiExample Example usage:
 * http://test.legle.cc:82/getCase
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
  let cases
  if(content){
    query.title = content
    cases = yield Case.find(query).exec()
  }else{
    cases = yield Case.find(query).sort({'meta.createdAt': -1}).skip(skip).limit(10).exec()
  }
  let recordTotal = yield Case.count(query).exec()
  this.body = {
    ret: 1,
    cases: cases,
    recordTotal: recordTotal,
    err: 'ok'
  }

}

/**
 * @api {get} /cases  客户端获取案例项目
 * @apiName cases
 * @apiGroup Case
 * @apiPermission anyBody
 *
 * @apiDescription cases
 *
 * @apiParam {String} title 根据title 来添加
 *
 * @apiExample Example usage:
 * http://test.legle.cc:82/cases
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
exports.cases = function *(next) {

  console.log(this.query)
  // p
  let id = this.query.id || ''
  // let number = this.query.pageNumber || 1
  // let skip = (number - 1) * 10
  let query = {}
  let cases
  let parts
  if(id){
    query._id = id
    cases = yield Case.find(query).exec()
  }else{
    // cases = yield Case.find(query).sort({'meta.createdAt': -1}).skip(skip).limit(10).exec()
    cases = yield Case.find(query).sort({'meta.createdAt': -1}).exec()
  }
  let recordTotal = yield Case.count(query).exec()

  if(cases) {
    let temp = []
    for (let i = 0; i < cases.length; i++) {
      temp.push(cases[i].part)
    }
    parts = [...new Set(temp)]
  }

  this.body = {
    ret: 1,
    parts: parts,
    cases: cases,
    recordTotal: recordTotal,
    err: 'ok'
  }

}

