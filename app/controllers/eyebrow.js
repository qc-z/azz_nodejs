'use strict'

const mongoose = require('mongoose')
const Eyebrow = mongoose.model('Eyebrow')
const Client = mongoose.model('Client')
const config = require('../../config/config')
const facepp = require('../service/facepp')

/**
 * @api {post} /eyebrowTest 纹眉测试
 * @apiName eyebrowTest
 * @apiGroup eyebrow
 * @apiPermission anyBody
 *
 * @apiDescription 纹眉测试 在服务端数据保存和同人分析.
 *
 * @apiParam {String} clientId 美容院或者分享连接里面的 clientId.
 * @apiParam {String} deviceId 安卓注册id
 * @apiParam {String} file 图片地址
 *
 * @apiExample Example usage:
 * http://azz.legle.cc/eyebrowTest
 *
 * @apiSuccess {Number}   code   1 代表成功，0 代表失败.
 * @apiSuccess {Object}   stars   看下面例子.
 *
 * @apiError code 0.
 * @apiError err   err message.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *       "code":1,
 *		    "uuid":"6x0g55e0",
 *		    "mobile":"15501451077",
 *		    "clientId":"591984001573d4687d6b5ded",
 *		    "shareUrl":"http://arpt.pjnice.com/arpt-wxarpt/report.html?uuid=6x0g55e0&clientId=591984001573d4687d6b5ded"
 *     	}
 */
exports.eyebrowTest = function *(next) {
	console.log(this.request.body)
	let body = this.request.body
	let clientId = body.clientId || ''
	let deviceId = body.deviceId
	let deviceType = body.deviceType
	let sex = body.sex
	let imgUrl = body.file

	sex = Number(sex)

	let originType = 'MO'
	if(deviceType == 'pc') {

		originType = 'AR'

		if(this.session.client && this.session.client.clientId) {
			clientId = this.session.client.clientId
		}

		if(!clientId || clientId === 'undefined' || clientId === 'null') {
			return (this.body = {code:0,err:'clientId not found'})
		}

		let client = yield Client.findOne({_id: clientId}).exec()

		if(!client) {
			return (this.body = {code:0,err:'client not found'})
		}

		// check role
		let eyebrowRole = client.eyebrowRole
		let toDate = eyebrowRole.to
		let timeNow = new Date()
		timeNow = timeNow.getTime()

		if(!eyebrowRole.role || (timeNow - toDate) > 0) {
			return (this.body = {
				code: 0,
				err: '没有使用权限'
			})
		}

		if(client.deviceId.length > 0 && client.deviceId.indexOf(deviceId) === -1 &&  client.deviceLimit <= client.deviceId.length) {
			return (this.body = {
				code: 0,
				err: '设备已经超过使用次数'
			})
		}

		if(client.deviceId.indexOf(deviceId) === -1) {
			client.deviceId.push(deviceId)
			yield client.save()
		}
	}


  let detect = yield facepp.detectUrl(imgUrl)

	if(!detect) {
		return (this.body = {code:0,err:'detect error'})
	}

	let _detect = facepp.findBigestFace(detect.faces)

	if(!_detect) {
		return (this.body = {code:0,err:'人脸识别失败'})
	}

  let compareR
  if(this.session.test && this.session.test.face_token) {
    compareR = yield facepp.compare(_detect.face_token, this.session.test.face_token)
  }

  let returnCode = 1
  if(!compareR) {
  	if(this.session.test && this.session.test.mobile) {
  		delete this.session.test.mobile
  	}
    this.session.test = {
        face_token: _detect.face_token
    }
  }

  let mobile = ''
  if(compareR && this.session.test.mobile) {
  	returnCode = 2
    mobile = this.session.test.mobile
  }


	this.body = {
		code: returnCode
	}

}


/**
 * @api {post} /eyebrowSave 纹眉测试值保存
 * @apiName eyebrowSave
 * @apiGroup eyebrow
 * @apiPermission anyBody
 *
 * @apiDescription 纹眉测试值保存
 *
 * @apiParam {String} improPic 原照片
 * @apiParam {String} eyebrowArr 眉型照片数组
 * @apiParam {String} clientId 可选
 *
 * @apiExample Example usage:
 * http://azz.legle.cc/eyebrowSave
 *
 * @apiSuccess {Number}   code   1 代表成功，0 代表失败.
 * @apiSuccess {Object}   stars   看下面例子.
 *
 * @apiError code 0.
 * @apiError err   err message.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *       "code":1,
 *		    "uuid":"6x0g55e0",
 *		    "shareUrl":"http://arpt.pjnice.com/arpt-wxarpt/report.html?uuid=6x0g55e0&clientId=591984001573d4687d6b5ded"
 *     	}
 */
exports.eyebrowSave = function *(next) {
	console.log(this.request.body)
	let body = this.request.body
	let clientId = body.clientId || ''
	let improPic = body.improPic
	let eyebrowArr = body.eyebrowArr

	if(!this.session.test || !this.session.test.mobile) {
		return (this.body = {
			code: 0,
			err: '手机未验证'
		})
	}

	let mobile = this.session.test.mobile
	let	uuid = Math.random().toString(36).substring(3, 11)
	let shareUrl = config.eyePc + '?uuid=' + uuid

	if(this.session.client) {
		clientId = this.session.client.clientId
	}

	let eye = new Eyebrow({
		uuid: uuid,
		clientId: clientId,
		shareUrl: shareUrl,
		improPic: improPic,
		eyebrowArr: eyebrowArr,
		mobile: mobile
	})

	yield eye.save()

	this.body = {
		code: 1,
		uuid: uuid,
		shareUrl: shareUrl
	}

}

/**
 * @api {get} /eyebrowGet 获取纹眉测试值
 * @apiName eyebrowGet
 * @apiGroup eyebrow
 * @apiPermission anyBody
 *
 * @apiDescription 根据uuid获取纹眉测试值
 *
 * @apiParam {String} uuid uuid
 *
 * @apiExample Example usage:
 * http://azz.legle.cc/eyebrowGet
 *
 * @apiSuccess {Number}   code   1 代表成功，0 代表失败.
 * @apiSuccess {Object}   stars   看下面例子.
 *
 * @apiError code 0.
 * @apiError err   err message.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *       "code":1,
 *		    "data":{测试值},
 *     	}
 */
exports.eyebrowGet = function *(next) {


	let uuid = this.query.uuid || ''

	let eye = yield Eyebrow.findOne({uuid: uuid}).exec()

	if(!eye) {
		return (this.body = {
			code: 0,
			err: 'not found'
		})
	}

	this.body = {
		code: 1,
		data: eye
	}

}






