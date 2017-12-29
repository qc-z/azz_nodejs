'use strict'

const mongoose = require('mongoose')
const StarTest = mongoose.model('Startest')
const Star = mongoose.model('Star')
const FaceSet = mongoose.model('FaceSet')
const Client = mongoose.model('Client')
const config = require('../../config/config')
const facepp = require('../service/facepp')


/**
 * @api {get} /starTest 获取明星面对面的测试值
 * @apiName getStarTest
 * @apiGroup Star
 * @apiPermission anyBody
 *
 * @apiDescription 在用户 B 打开用户 A 分享出来的连接，根据 uuid 或者 手机号码 获取明星面对面测试的值.
 *
 * @apiParam {String} uuid 分享连接里面的 uuid.
 * @apiParam {String} clientId 可选参数，分享连接里面的 clientId.
 *
 * @apiExample Example usage:
 * http://test.legle.cc/starTest?uuid=8svvmhnt
 *
 * @apiSuccess {Number}   code   1 代表成功，0 代表失败.
 * @apiSuccess {Object}   star   看下面示例.
 *
 * @apiError code 0  .
 * @apiError err   err message.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *       "code":1,
 *		    "uuid":"6x0g55e0",
 *		    "image_path":"....",
 *		    "clientId":"591984001573d4687d6b5ded",
 *		    "shareUrl":"http://arpt.pjnice.com/arpt-wxarpt/report.html?uuid=6x0g55e0&clientId=591984001573d4687d6b5ded",
 *		    "sex":0,
 *		    "starData":[{
 *		        "_id":"591bbbce14cebc8c010a341f",
 *		        "star_id":19,
 *		        "name":"陈乔恩 ",
 *		        "sex":0,
 *		        "picture":"http://120.132.68.45:3004/public/images/star/1492151197260.png",
 *		        "introduction":"陈乔恩随七朵花团体进军乐坛。2005年，其主演的爱情喜剧《王子变青蛙》打破台湾偶像剧收视纪录。 ",
 *		        "face_token":"6198e6319e7bdca7bb9b164ac22af188",
 *		        "country_id":1,
 *		        "userid":"002",
 *		        "extend":Object{...},
 *		        "country":Object{...},
 *		        "__v":0,
 *		        "faceTest":Object{...},
 *		        "skinTest":Object{...},
 *		        "meta":{
 *		            "updatedAt":"2017-05-17T09:05:07.909Z",
 *		            "createdAt":"2017-05-17T02:56:14.969Z"
 *		        }
 *		    },{star1},{star2}]
 *     	}
 */
exports.getStarTest = function *(next) {
	console.log(this.query)
	let uuid = this.query.uuid || ''
	let clientId = this.query.clientId || ''

	if(!uuid) {
		return (this.body = {code:0,err:'请求参数不能为空'})
	}

	let star = yield StarTest.findOne({uuid: uuid}).exec()

	if(!star) {
		return (this.body = {
			code: 0,
			err: '没有找到明星面对面测试数据'
		})
	}

	this.body = {
		code: 1,
		uuid: star.uuid,
		clientId: star.clientId,
		image_path: star.image_path,
		shareUrl: star.shareUrl,
		sex: star.sex,
		starsData: star.starInfo
	}
}



/**
 * @api {post} /starTestUrl 明星面对面提交测试
 * @apiName starTestUrl
 * @apiGroup starTestUrl
 * @apiPermission anyBody
 *
 * @apiDescription 在用户 B 根据 uuid 或者 手机号码 pc端 明星面对面提交测试.
 *
 * @apiParam {String} clientId 美容院或者分享连接里面的 clientId.
 * @apiParam {String} deviceId 安卓注册id
 * @apiParam {Number} sex 0代表女生，1代表男士.
 * @apiParam {String} file 上传到阿里云后得到的不带阿里云 host 的 图片路径如：star-test/156177833271501495175.jpg
 *
 * @apiExample Example usage:
 * http://test.legle.cc/starTestUrl
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
 *		    "clientId":"591984001573d4687d6b5ded",
 *		    "shareUrl":"http://arpt.pjnice.com/arpt-wxarpt/report.html?uuid=6x0g55e0&clientId=591984001573d4687d6b5ded",
 *		    "confidence":63.504,
 *		    "country":"中国",
 *		    "sex":0,
 *		    "starData": [{star1},{star2},{star3},{star4}]
 *     	}
 */
exports.starTestUrl = function *(next) {
	console.log(this.request.body)
	let body = this.request.body
	let clientId = body.clientId || ''
	let deviceId = body.deviceId
	let deviceType = body.deviceType
	let sex = body.sex
	let imgUrl = body.file

	sex = Number(sex)

	let	uuid = Math.random().toString(36).substring(3, 11)

	let shareUrl = config.reportStarUrlPc + '?uuid=' + uuid

  if(!imgUrl) {
  	return (this.body = {code:0,err:'没有收到文件'})
  }

  let originType = 'MO'

  // pc 权限限制
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
		let starRole = client.starRole
		let toDate = starRole.to
		let timeNow = new Date()
		timeNow = timeNow.getTime()

		if(!starRole.role || (timeNow - toDate) > 0) {
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
  let returnCode = 1
  if(this.session.test && this.session.test.face_token) {
    compareR = yield facepp.compare(_detect.face_token, this.session.test.face_token)
  }

  if(_detect.attributes && _detect.attributes.gender && _detect.attributes.gender.value) {
  	if(_detect.attributes.gender.value == 'Male') {
  		sex = 1
  	}
  	else {
  		sex = 0
  	}
  }

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

  let faceset = yield FaceSet.findOne({sex: sex, name: '全球'}).exec()

	if(!faceset) {
		return (this.body = {
			code: 0,
			err: 'faceset not found'
		})
	}

	let faceSetToken = faceset.faceset_token


	if(!faceSetToken) {
		return (this.body = {
			code: 0,
			err: 'faceSetToken not found'
		})
	}

  // 找相似明星
  let search = yield facepp.searchFaceset(_detect.face_token, faceSetToken)

  if(!search.results || !search.results[0] || !search.results[0].confidence || !search.results[0].face_token) {
  	return (this.body = {code:0,err:'face 查找失败'})
  }

  let starsData = []

  for (var i = search.results.length - 1; i >= 0; i--) {
  	if(search.results[i] && search.results[i].face_token) {
	  	let starData = yield Star.findOne({face_token: search.results[i].face_token}, {name: 1, sex: 1, picture: 1, introduction: 1, country_id: 1, country: 1}).exec()
	  	let start = {
	  		confidence: search.results[i].confidence,
	  		star: starData
	  	}
	  	starsData.push(start)
  	}
  }

  if(!starsData.length === 0) {
  	return (this.body = {
  		code: 0,
  		err: '没有找到和他相像的明星'
  	})
  }

	const starSave = new StarTest({
	  image_path: imgUrl,
	  sex: sex,
	  starInfo: starsData,
	  originType: originType,
	  uuid: uuid,
	  shareUrl: shareUrl,
	  mobile: mobile,
	  clientId: clientId
	})

	yield starSave.save()

	this.body = {
		code: returnCode,
		uuid: uuid,
		clientId: clientId,
		image_path: imgUrl,
		shareUrl: shareUrl,
		sex: sex,
		mobile: mobile,
		starsData: starsData
	}

}







