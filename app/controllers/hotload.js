'use strict'
const mongoose = require('mongoose')
const Hotload = mongoose.model('Hotload')

/**
 * @api {get} /hotloadInfo  资源更新版本信息
 * @apiName hotloadInfo
 * @apiGroup Hotload
 * @apiPermission User
 *
 * @apiDescription 资源更新版本信息
 *
 *
 * @apiExample Example usage:
 * http://test.legle.cc:82/hotloadInfo
 *
 * @apiSuccess {Object}   data 'ok'
 *
 * @apiError ret 0
 * @apiError err   err message
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *        ret: 1, // 1 成功 0 失败
 *        data: [
 *          {resName: 'style.css', resType: 'css', version: 'v1.0.0', resUrl: 'aliyun.com/style.css'},
 *          {resName: 'about.html', resType: 'html', version: 'v1.0.0', resUrl: 'aliyun.com/about.html'}
 *        ]
 *     }
 */
exports.hotloadInfo = function *(next) {
  let device = this.request.body.device
  let hotLoad = yield Hotload.find({device: device}).exec()

  if(!hotLoad) {
     return (this.body = {
      ret: 0,
      msg: '该应用包不存在'
     })
  }

  this.body = {
    ret: 1,
    data: hotLoad
  }
}

exports.getHotloadList = function *(next) {
  let content = this.query.content || ''
  let number = this.query.pageNumber || 1

  let skip = (number - 1) * 10

  let query = {}
  let hotLoads = []
  if(content) {
    query.resName = content
    hotLoads = yield Hotload.find(query).exec()
  } else {
    hotLoads = yield Hotload.find(query).sort({'meta.createdAt': -1}).skip(skip).limit(10).exec()
  }
  let recordTotal = yield Hotload.count(query).exec()
    
  this.body = {
    ret: 1,
    recordTotal: recordTotal,
    data: hotLoads
  }
}

/**
 * @api {get} /editHotload  编辑资源更新版本信息
 * @apiName editHotload
 * @apiGroup Hotload
 * @apiPermission User
 *
 * @apiDescription 编辑资源更新版本信息
 *
 * @apiParam {String} _id 资源_id
 * @apiParam {String} resName 资源名称
 * @apiParam {String} version 版本
 * @apiParam {String} resUrl  下载地址
 * @apiParam {String} resType  放到那个资源文件夹（html, css, js, image, base）
 *
 * @apiExample Example usage:
 * http://test.legle.cc:82/editHotload
 *
 * @apiSuccess {Object}   msg 'ok'
 *
 * @apiError ret 0
 * @apiError err   err message
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *        ret: 1, // 1 成功 0 失败
 *        msg: ok
 *     }
 */
exports.editHotload = function *(next) {

  let hotloadId = this.request.body._id || ''
  let action = this.request.body.action || ''
  let hotload = yield Hotload.findOne({_id: hotloadId}).exec()
  let bodyKeys = Object.keys(this.request.body)
  if(!hotload) {
    return (this.body = {
      ret: 0,
      err: '该版本不存在'
    })
  }

  if(action === 'delete') {
    yield hotload.remove()
    return (this.body = {
      ret: 2,
      msg: 'ok'
    })
  }

  for(let i = 0;i < bodyKeys.length;i++){
  	let key = this.request.body[bodyKeys[i]]
  	if(bodyKeys[i] !== '_id' && bodyKeys[i] !=='action'){
  		hotload[bodyKeys[i]] = key
  		console.log(hotload)
  	}
  }
  yield hotload.save()

  this.body = {
    ret: 1,
    msg: 'ok'
  }

}


/**
 * @api {get} /addHotload  添加资源更新版本信息
 * @apiName addHotload
 * @apiGroup Hotload
 * @apiPermission User
 *
 * @apiDescription 添加资源更新版本信息
 *
 * @apiParam {String} resName 资源名称
 * @apiParam {String} version 版本
 * @apiParam {String} resUrl  下载地址
 * @apiParam {String} resType  放到那个资源文件夹（html, css, js, image, base）
 *
 * @apiExample Example usage:
 * http://test.legle.cc:82/addHotload
 *
 * @apiSuccess {Object}   msg 'ok'
 *
 * @apiError ret 0
 * @apiError err   err message
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *        ret: 1, // 1 成功 0 失败
 *        msg: ok
 *     }
 */
exports.addHotload = function *(next) {
  let {resName, version, resUrl, resType,device} = this.request.body

  let hotload = yield Hotload.findOne({resName: resName, version: version, resUrl: resUrl, resType: resType, device: device}).exec()

  if(hotload) {
    return (this.body = {
      ret: 0,
      msg: '该版本号已经存在'
    })
  }
  
  let hotloadArr = {
    resName: resName,
    version: version,
    resType: resType,
    resUrl: resUrl,
    device: device
  }

  let newhotload = new Hotload(hotloadArr)

  yield newhotload.save()

  this.body = {
    ret: 1,
    msg: 'ok'
  }

}

