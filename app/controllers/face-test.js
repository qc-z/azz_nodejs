'use strict'

const mongoose = require('mongoose')
const Client = mongoose.model('Client')
const Operation = mongoose.model('Operation')
const Case = mongoose.model('Case')
const Face = mongoose.model('Face')
const facepp = require('../service/facepp')
const config = require('../../config/config')



exports.testdata = function *(next) {
    let operations = yield Operation.find({},{name:1,introduction:1}).exec()
    let cases = yield Case.find({},{title:1}).exec()
    for(let i = 0;i < operations.length;i++){
        for(let j = 0;j < cases.length;j++){
            if(operations[i].introduction !== "" && cases[j].title == operations[i].name){
                cases[j].des = operations[i].introduction
                yield cases[j].save()
            }
        }
    }
    this.body = {
        code: 1,
        err:"ok"
    }

}

async function recommend(testValue) {


  let aa = testValue.sTotle_Scores

  delete aa.eyebrowScore
  delete aa.kanXiangScore

  let bb = Object.entries(aa)

  let cc = bb.sort((a,b) => a[1] - b[1])

  let d = cc[0][0]

  let effects = {
    noseScore: '鼻部微整',
    eyeScore: '眼部微整',
    outLineScore: '瘦脸',
    mouthScore: '美唇'
  }

  let recommends = await Operation.find({effect: effects[d]}, {name: 1, price: 1, collationschematic: 1}).exec()

  function getRandomArrayElements(arr, count) {
    var shuffled = arr.slice(0), i = arr.length, min = i - count, temp, index;
    while (i-- > min) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(min);
  }

  if(recommends.length > 3) {
    recommends = getRandomArrayElements(recommends, 3)
  }

  return recommends

}

exports.faceaa = function *(next) {
  let aa = {
    sTotle_Scores: {
      "outLineScore":65.45,
      "eyebrowScore":89.32,
      "eyeScore":65.25,
      "noseScore":70.02,
      "mouthScore":65.03,
      "kanXiangScore":80.25
    }
  }
  let cc = yield recommend(aa)

  this.body = cc

}

/**
 * @api {get} /lookTest 根据 uuid 或者 手机号码 获取颜值测试的值
 * @apiName getFaceTest
 * @apiGroup Face
 * @apiPermission anyBody
 *
 * @apiDescription 在用户 B 打开用户 A 分享出来的连接，根据 uuid 或者 手机号码 获取颜值测试的值.
 *
 * @apiParam {String} uuid 分享连接里面的 uuid.
 * @apiParam {String} mobile 可选参数，AR 后台用来获取某个用户的颜值测试值.
 *
 * @apiExample Example usage:
 * http://test.legle.cc/lookTest?uuid=1234&mobile=15501451077
 *
 * @apiSuccess {Number}   code   1 代表成功，0 代表失败.
 * @apiSuccess {Object}   looks   测试返回值.
 *
 * @apiError code 0.
 * @apiError err   err message.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *       "code": 1
 *       "look": {
 *       "LooksTotalScore":91.2,
 *       "Face":Object{...},
 *       "Landmark":Object{...},
 *       "Image_path":null,
 *       "Ima_width":432,
 *       "Ima_height":432,
 *       "SKanXiang":Object{...},
 *       "KanXiangScore":89.7,
 *       "SOutLine":Object{...},
 *       "OutLineScore":86,
 *       "SEyebrow":Object{...},
 *       "EyebrowScore":96.5,
 *       "SEye":Object{...},
 *       "EyeScore":90.6,
 *       "SNose":Object{...},
 *       "NoseScore":92.8,
 *       "SMouth":Object{...},
 *       "MouthScore":94.6,
 *       "TestValue":Object{...},
 *			 "uuid": '123',
 *			 "shareUrl": 'http...'
 *     	}
 */
exports.getTest = function *(next) {
    let uuid = this.query.uuid || ''

    if(!uuid) {
        return (this.body = {code:0,err:'请求参数不能为空'})
    }

    let face = yield Face.findOne({uuid: uuid}).exec()

    if(!face) {
        return (this.body = {
            code: 0,
            err: '没有找到颜值测试数据'
        })
    }

    let returnData = {
        LooksTotalScore: face.looksTotalScore,
        Face: face.face,
        Image_path: face.image_path,
        Ima_width: face.ima_width,
        Ima_height: face.ima_height,
        SKanXiang: face.sKanXiang,
        KanXiangScore: face.kanXiangScore,
        SOutLine: face.sOutLine,
        OutLineScore: face.outLineScore,
        SEyebrow: face.sEyebrow,
        EyebrowScore: face.eyebrowScore,
        SEye: face.sEye,
        EyeScore: face.eyeScore,
        SNose: face.sNose,
        NoseScore: face.noseScore,
        SMouth: face.sMouth,
        MouthScore: face.mouthScore,
        TestValue: face.testValue,
        uuid: face.uuid,
        shareUrl: face.shareUrl
    }

    const recommends = yield recommend(face.testValue)

    this.body = {
        code: 1,
        recommends: recommends,
        looks: returnData
    }

}


/**
 * @api {post} /lookTestUrl 根据 uuid 或者 手机号码 和 阿里云图片 url生成颜值测试的值
 * @apiName postFaceTest
 * @apiGroup Face
 * @apiPermission anyBody
 *
 * @apiDescription 在用户 B 根据 uuid 或者 手机号码 产生颜值测试的值.
 *
 * @apiParam {String} clientId 美容院或者分享连接里面的 clientId.
 * @apiParam {String} deviceId 可选参数，后台用来判断这个设备是否有权限测试.
 * @apiParam {String} file 阿里云图片路径.
 *
 * @apiExample Example usage:
 * http://test.legle.cc/lookTest
 *
 * @apiSuccess {Number}   code   1 代表成功，0 代表失败.
 * @apiSuccess {Object}   looks   测试返回值.
 *
 * @apiError code 0.
 * @apiError err   err message.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *       "code": 1
 *       "look": {
 *       "LooksTotalScore":91.2,
 *       "Face":Object{...},
 *       "Landmark":Object{...},
 *       "Image_path":null,
 *       "Ima_width":432,
 *       "Ima_height":432,
 *       "SKanXiang":Object{...},
 *       "KanXiangScore":89.7,
 *       "SOutLine":Object{...},
 *       "OutLineScore":86,
 *       "SEyebrow":Object{...},
 *       "EyebrowScore":96.5,
 *       "SEye":Object{...},
 *       "EyeScore":90.6,
 *       "SNose":Object{...},
 *       "NoseScore":92.8,
 *       "SMouth":Object{...},
 *       "MouthScore":94.6,
 *       "TestValue":Object{...},
 *			 "uuid": '123',
 *			 "shareUrl": 'http...'
 *     	}
 */
exports.lookTestUrl = function *(next) {
    console.log('@@@@', this.request.body)
    let body = this.request.body
    let clientId = body.clientId || ''
    let deviceId = body.deviceId
    let deviceType = body.deviceType
    let imgUrl = body.file

    let uuid = Math.random().toString(36).substring(3, 11)
    let shareUrl = config.reportFaceUrl + '?uuid=' + uuid

    let originType = 'MO'
    if(deviceType == 'pc') {
        let originType = 'AR'
        if(!clientId) {
            return (this.body = {code:0,err:'clientId not found'})
        }
        if(!imgUrl) {
            return (this.body = {code:0,err:'没有收到文件'})
        } else {
            imgUrl = config.aliyun.ossHost + '/' + imgUrl
        }

        let client = yield Client.findOne({_id: clientId}).exec()

        if(!client || !deviceId) {
            return (this.body = {
                code: 0,
                err: '客户不存在 请先登录'
            })
        }

        let faceRole = client.faceRole
        let toDate = faceRole.to
        let timeNow = new Date()
        timeNow = timeNow.getTime()

        if(!faceRole.role || (timeNow - toDate) > 0) {
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

        if (client.deviceId.indexOf(deviceId) === -1) {
            client.deviceId.push(deviceId)
            yield client.save()
        }
    }
    
    let facedata = yield facepp.detectUrl(imgUrl)

    if(!facedata) {
        return (this.body = {code:0,err:'颜值测试异常'})
    }

    let _face = facepp.findBigestFace(facedata.faces)
    // let _face = facedata.faces[0]

    if(!_face) {
      return (this.body = {
        code: 0,
        err: '人脸识别失败'
      })
    }

    let returnCode = 1
    let compareR
    if(this.session.test && this.session.test.face_token) {
      compareR = yield facepp.compare(_face.face_token, this.session.test.face_token)
    }


    if(!compareR) {
      if(this.session.test && this.session.test.mobile) {
        delete this.session.test.mobile
      }
      this.session.test = {
          face_token: _face.face_token
      }
    }

    let mobile = ''
    if(compareR && this.session.test.mobile) {
        returnCode = 2
        mobile = this.session.test.mobile
    }

    // adaptive old skin old Api
    _face.attribute=_face.attributes
    _face.attribute.smiling=_face.attribute.smile
    _face.face_id = _face.face_token

    let looks = yield facepp.cloudtest(_face)
    looks.Image_path = imgUrl

    let faceSave = new Face({
        looksTotalScore: looks.LooksTotalScore, //面容总分
        face: looks.Face, // face++原始数据
        image_path: imgUrl, // 图片路径
        ima_width: looks.Ima_width,// 对应图像宽度
        ima_height: looks.Ima_height, // 对应图像高度
        sKanXiang: looks.SKanXiang, // 看相参数（对象，包含其他字段，详细看TestValue）
        kanXiangScore: looks.KanXiangScore, // 看相分数
        sOutLine: looks.SOutLine, // 轮廓参数（对象，包含其他字段，详细看TestValue）
        outLineScore: looks.OutLineScore, // 轮廓评分
        sEyebrow: looks.SEyebrow, // 眉参数（对象，包含其他字段，详细看TestValue
        eyebrowScore: looks.EyebrowScore, // 眉评分（对象，包含其他字段，详细看TestValue
        sEye: looks.SEye, // 眼参数（对象，包含其他字段，详细看TestValue）
        eyeScore: looks.EyeScore, // 眼评分
        sNose: looks.SNose, // 鼻参数（对象，包含其他字段，详细看TestValue）
        noseScore: looks.NoseScore, // 鼻评分
        sMouth: looks.SMouth, // 口参数（对象，包含其他字段，详细看TestValue
        mouthScore: looks.MouthScore, // 口评分
        testValue: looks.TestValue, // 面部测试数据
        originType: originType,
        uuid: uuid,
        mobile: mobile,
        shareUrl: shareUrl,
        clientId: clientId
    })

    yield faceSave.save()

    const recommends = yield recommend(looks.TestValue)
    console.log('returnCode', returnCode)

    this.body = {
        code: returnCode,
        recommends: recommends,
        looks: looks,
        uuid:uuid,
        clientId:clientId,
        mobile: mobile,
        shareUrl: shareUrl
    }
        
}


