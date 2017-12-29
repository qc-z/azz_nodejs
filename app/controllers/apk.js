'use strict'
const mongoose = require('mongoose')
const Apk = mongoose.model('Apk')


/**
 * @api {post} /apkInfo   查找应用包信息
 * @apiName apkInfo
 * @apiGroup Apk
 * @apiPermission User
 *
 * @apiDescription 获取应用包信息
 *
 * @apiParam {String} versionName 版本号
 * @apiParam {String} id 版本id
 *
 * @apiExample Example usage:
 * http://test.legle.cc:82/apkInfo
 *
 * @apiSuccess {Object}   version 'ok'
 *
 * @apiError ret 0
 * @apiError err   err message
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *        ret: 1, // 1 成功 0 失败
 *        version: {
 *          id: 'sfd26yns', // 唯一id，表示每个发行版本的唯一id
 *          versionName: '1.0.0', // 版本号
 *          versionCode: 1, // 版本更新次数
 *          download: 'http://'
 *          updateHard: 'yes' 
 *          device: 'app' 
 *        }
 *     }
 */
exports.apkInfo = function *(next) {
 let {id, versionName} = this.request.body


 let apk = yield Apk.findOne({id: id, versionName: versionName}).exec()

 if(!apk) {
   return (this.body = {
    ret: 0,
    err: '该应用包不存在'
   })
 }

  this.body = {
    ret: 1,
    version: apk
  }
}


/**
 * @api {post} /latestVersion   获取最新版本
 * @apiName latestVerson
 * @apiGroup Apk
 * @apiPermission User
 *
 * @apiDescription 获取对应 渠道和马甲 的最新版本
 *
 * @apiParam {String} device 设备类型是 pc 还是 app
 *
 * @apiExample Example usage:
 * http://test.legle.cc:82/latestVersion
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
 *        version: {
 *          id: 'sfd26yns', // 唯一id，表示每个发行版本的唯一id
 *          versionName: '1.0.0', // 版本号
 *          versionCode: 1, // 版本更新次数
 *          download: 'http://'
 *          updateHard: 'yes' 
 *          device: 'app' 
 *        }
 *     }
 */
exports.latestVersion = function *(next) {

  let device = this.request.body.device
	let type = this.request.body.type

  let apks = yield Apk.find({device: device,type:type}).exec()

  apks = apks.sort(function(item1, item2) {
    return item2.versionCode - item1.versionCode
  })

  let apk = apks[0]

  if(!apk) {
    return (this.body = {
      ret: 0,
      msg: '该应用包不存在'
    })
  }


  this.body = {
    ret: 1,
    data: apk
  }

}



/**
 * @api {get} /getApk   获取应用包信息
 * @apiName getApk
 * @apiGroup Apk
 * @apiPermission User
 *
 * @apiDescription 获取应用包信息
 *
 *
 * @apiExample Example usage:
 * http://test.legle.cc:82/getApk
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
 *        version: {
 *          id: 'sfd26yns', // 唯一id，表示每个发行版本的唯一id
 *          versionName: '1.0.0', // 版本号
 *          versionCode: 1, // 版本更新次数
 *          download: 'http://'
 *          updateHard: 'yes' 
 *          device: 'app' 
 *        }
 *     }
 */
exports.getApk = function *(next) {


	this.body = {
    ret: 1,
    data: {
      id: 'android7',
      device: 'pc',
      versionName: '1.0.2',
      versionCode: 3,
      download: 'http://androidyoubang.oss-cn-shanghai.aliyuncs.com/%E5%AE%A0%E7%88%B1%E8%9C%9C%E8%AF%ADv1.0.2_release_bd_8_19.apk',
      updateHard: 'yes'
  }
}}


exports.getApkList = function *(next) {
  let content = this.query.content || ''
  let number = this.query.pageNumber || 1

  let skip = (number - 1) * 10

  let query = {}
  let apks = []
  if(content) {
    query.id = content
    apks = yield Apk.find(query).exec()
  } else {
    apks = yield Apk.find(query).sort({'meta.createdAt': -1}).skip(skip).limit(10).exec()
  }
  let recordTotal = yield Apk.count(query).exec()
    
  this.body = {
    ret: 1,
    recordTotal: recordTotal,
    coupons: apks
  }
}


/**
 * @api {post} /editApk   编辑应用包信息
 * @apiName editApk
 * @apiGroup Apk
 * @apiPermission User
 *
 * @apiDescription 编辑应用包信息
 *
 * @apiParam {String} versionName 版本号
 * @apiParam {String} versionName 版本号
 * @apiParam {String} versionCode 版本更新次数
 * @apiParam {String} download 下载地址
 * @apiParam {String} updateHard 是否强制更新
 * @apiParam {String} device 设备类型是 pc 还是 app
 *
 * @apiExample Example usage:
 * http://test.legle.cc:82/editApk
 *
 * @apiSuccess {Object}   version 'ok'
 *
 * @apiError ret 0
 * @apiError err   err message
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *        ret: 1, // 1 成功 0 失败
 *        version: {
 *          id: 'sfd26yns', // 唯一id，表示每个发行版本的唯一id
 *          versionName: '1.0.0', // 版本号
 *          versionCode: 1, // 版本更新次数
 *          download: 'http://'
 *          updateHard: 'yes' 
 *          device: 'app' 
 *        }
 *     }
 */
exports.editApk = function *(next) {
  let apkId = this.request.body._id || ''
  let action = this.request.body.action || ''
  let apk = yield Apk.findOne({id: apkId}).exec()
  let bodyKeys = Object.keys(this.request.body)
  if(!apk) {
    return (this.body = {
      ret: 0,
      err: '该版本不存在'
    })
  }

  if(action === 'delete') {
    yield apk.remove()
    return (this.body = {
      ret: 2,
      msg: 'ok'
    })
  }
  console.log("this.request.body",this.request.body)
  for(let i = 0;i < bodyKeys.length;i++){
  	let key = this.request.body[bodyKeys[i]]
  	if(bodyKeys[i] !== '_id' && bodyKeys[i] !=='action'){
  		apk[bodyKeys[i]] = key
  	}
  }
  yield apk.save()

  this.body = {
    ret: 1,
    msg: 'ok'
  }

}



/**
 * @api {post} /apkInfo   查找应用包信息
 * @apiName apkInfo
 * @apiGroup Apk
 * @apiPermission User
 *
 * @apiDescription 获取应用包信息
 *
 * @apiParam {String} versionName 版本号
 * @apiParam {String} versionCode 版本更新次数
 * @apiParam {String} download 下载地址
 * @apiParam {String} updateHard 是否强制更新
 * @apiParam {String} device 设备类型是 pc 还是 app
 *
 * @apiExample Example usage:
 * http://test.legle.cc:82/apkInfo
 *
 * @apiSuccess {Object}   version 'ok'
 *
 * @apiError ret 0
 * @apiError err   err message
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *        ret: 1, // 1 成功 0 失败
 *        version: {
 *          id: 'sfd26yns', // 唯一id，表示每个发行版本的唯一id
 *          versionName: '1.0.0', // 版本号
 *          versionCode: 1, // 版本更新次数
 *          download: 'http://'
 *          updateHard: 'yes' 
 *          device: 'app' 
 *        }
 *     }
 */
exports.addApk = function *(next) {

  let id = this.request.body.id || Math.random().toString(36).substring(3, 11)

  let bodyKeys = Object.keys(this.request.body)
  let apk = yield Apk.findOne({id: id}).exec()

  if(apk) {
    return (this.body = {
      ret: 0,
      msg: '该版本号已经存在'
    })
  }
  let apkArr = {}
  for(let i = 0;i < bodyKeys.length;i++){
  	let key = this.request.body[bodyKeys[i]]
  		apkArr[bodyKeys[i]] = key
  	}
    apkArr.id = id
  console.log("apkArr[id]",apkArr.id)

   
  let newApk = new Apk(apkArr)

  yield newApk.save()

  this.body = {
    ret: 1,
    msg: 'ok'
  }

}




