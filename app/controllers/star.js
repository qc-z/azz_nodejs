'use strict'

const mongoose = require('mongoose')
const FaceSet = mongoose.model('FaceSet')
const Star = mongoose.model('Star')
const Msg = require('../libs/msg')
const StarMember = mongoose.model('StarMember')
const config = require('../../config/config')
const facepp = require('../service/facepp')



/**
 * @api {post} /creatFaceSet   添加图片库
 * @apiName star
 * @apiGroup star
 *
 * @apiParam {String} name   国家名称
 * @apiParam {String} sex    明星性别
 *
 * @apiExample Example usage:
 * http://test.legle.cc/creatFaceSet
 *
 * @apiSuccess {Number}   code   1.
 * @apiSuccess {String}   err 'ok'.
 */
exports.creatFaceSet = function *(next) {
    let name = this.request.body.name
    let sex = this.request.body.sex

    if(name === '' || sex === '') {
        return (this.body = {
            code: 1,
            err: '参数为空'
        })
    }

    let display_name = name + sex

    let faceset = yield FaceSet.findOne({display_name: display_name}).exec()

    if(faceset) {
        return (this.body = {
            code: 1,
            err: '该图库已存在'
        })
    }

    sex = Number(sex)

    let faceset_token = this.request.body.faceset_token

    if(!faceset_token) {
        let result = yield facepp.createFaceset(display_name)
        if(result && result.faceset_token) {
            faceset_token = result.faceset_token
        }
    }

    let newFaceSet = new FaceSet ({
        display_name: display_name,
        name: name,
        sex: sex,
        faceset_token: faceset_token
    })

    yield newFaceSet.save()

    return (this.body = {
        code: 1,
        err: 'ok'
    })
}



/**
 * @api {post} /delFaceSet   删除图片库
 * @apiName star
 * @apiGroup star
 *
 * @apiParam {String} name   国家名称
 * @apiParam {String} sex    明星性别
 *
 * @apiExample Example usage:
 * http://test.legle.cc/delFaceSet
 *
 * @apiSuccess {Number}   code   1.
 * @apiSuccess {String}   err 'ok'.
 */
exports.delFaceSet = function *(next) {
    let faceSetID = this.request.query.faceSetID || ''

    let faceset = yield FaceSet.findOne({_id: faceSetID}).exec()

    if(faceset && faceset.faceset_token) {
        let name = faceset.name || ''
        let sex = faceset.sex || ''

        let face = yield Star.findOne({faceset_token: faceset.faceset_token}).exec()
        let _face = yield Star.findOne({'country.name': name, sex: sex}).exec()
        if(face || _face) {
            return (this.body = {
                code: 0,
                err: '该地区的明星还存在，请先把该地区的明星先删除干净再删除这个地区'
            })
        }

        yield facepp.delFaceSet(faceset.faceset_token)
        yield faceset.remove()
    }else{
        return (this.body = {
            code: 0,
            err: '参数不能为空'
        })
    }
    return (this.body = {
        code: 1,
        err: 'ok'
    })

}


/**
 * @api {post} /faceSetList   获取图片库列表
 * @apiName star
 * @apiGroup star
 *
 * @apiExample Example usage:
 * http://test.legle.cc/creatFaceSet
 *
 * @apiSuccess {Number}   code   1.
 * @apiSuccess {String}   err 'ok'.
 */
exports.faceSetList = function *(next) {
    let facesets = yield FaceSet.find().sort({'Faceset_no': -1}).exec()
    return (this.body = {
        code: 1,
        facesets: facesets
    })
}

/**
 * @api {post} /faceCountryList   获取图片库列表
 * @apiName star
 * @apiGroup star
 *
 * @apiExample Example usage:
 * http://test.legle.cc/creatFaceSet
 *
 * @apiSuccess {Number}   code   1.
 * @apiSuccess {String}   err 'ok'.
 */
exports.faceCountryList = function *(next) {

    function unique(a) {

      var res = a.filter(function(item, index, array) {
        return array.indexOf(item) === index
      })
      return res
    }

    let countrys = yield FaceSet.find({}, {_id: 0, name: 1}).exec()
    let countrysArr = []

    for(let index in countrys) {
        countrysArr.push(countrys[index].name)
    }

    countrysArr = unique(countrysArr)

    return (this.body = {
        code: 1,
        countrys: countrysArr
    })
}






/**
 * @api {post} /delFaceSet   添加明星资料到图片库
 * @apiName star
 * @apiGroup star
 *
 * @apiParam {String} name   国家名称
 * @apiParam {String} sex    明星性别
 *
 * @apiExample Example usage:
 * http://test.legle.cc/creatFaceSet
 *
 * @apiSuccess {Number}   code   1.
 * @apiSuccess {String}   err 'ok'.
 */
exports.addFaceToFaceSet = function *(next) {
    //    1: '中国', 2: '韩国', 3: '马来西亚', 4: '美国', 5: '新加坡'
    let body = this.request.body
    let sex = body.sex
    let name = body.name || ''
    let introduction = body.introduction
    sex = Number(sex)
    let country = body.country
    let file = body.file
    file = config.aliyun.ossHost + '/' + file

    if(!country) {
        return (this.body = {
            code: 0,
            err: '参数错误'
        })
	}

    //根据姓名和性别查找明星
    let existStar = yield Star.findOne({name: name, sex: sex}).exec()

    if(existStar) {
        return (this.body = {
            code: 0,
            err: '这个明星已经存在'
        })
    }
    //根据国家和明星性别去匹配有没有对应的图库。
    let faceset = yield FaceSet.findOne({name: country, sex: sex}).exec()

    if(!faceset) {
        return (this.body = {code:0,err:'该图片库不存在，请添加图片库'})
    }
    let faceset_token = faceset.faceset_token

    //判断有没有获取图片数据
    if(!body.file) {
        return (this.body = {code:0,err:'没有收到文件'})
    }


    //进行颜值测试，并返回测试分数。
    let detectData = yield facepp.detectUrl(file)
    if(!detectData) {
        return (this.body = {code:0,err:'detect err'})
    }

    let _face = facepp.findBigestFace(detectData.faces)

    if(!_face) {
        return (this.body = {code:0,err:'人脸识别失败'})
    }

    // adaptive old face old Api
    _face.attribute =_face.attributes
    _face.attribute.smiling =_face.attribute.smile
    _face.face_id = _face.face_token

    let face_token = _face.face_token

    let skin = yield facepp.skincloudtestImg(file)


    let looks = yield facepp.cloudtest(_face)

    if(face_token && faceset_token) {
        yield facepp.addFace(face_token, faceset_token)
    }

    let newStar = new Star({
        name: name,
        sex: sex,
        picture: file,
        introduction: introduction,
        face_token: face_token,
        faceset_token: faceset_token,
        extend: detectData,
        country: {
            name:country
        },
        faceTest: looks,
        skinTest: skin
    })


    yield newStar.save(newStar)

    this.body = {
        code: 1,
        err: 'ok'
    }
}


/**
 * @api {post} /delFaceToFaceSet   编辑明星库的明星信息
 * @apiName star
 * @apiGroup star
 *
 * @apiParam {String} id          明星id
 * @apiParam {String} pagination    页码
 *
 * @apiExample Example usage:
 * http://test.legle.cc/FaceToFaceSetList
 *
 * @apiSuccess {Number}   code   1.
 * @apiSuccess {String}   err 'ok'.
 */
exports.editFaceToFaceSet = function *(next) {
    let _id = this.request.body._id || ''
    let sex = this.request.body.sex
    let name = this.request.body.name
    let country = this.request.body.country
    let introduction = this.request.body.introduction
    sex = Number(sex)
    let file = this.request.body.file
    file = config.aliyun.ossHost + '/' + file

    if (!country || !_id) {
        return (this.body = {
            code: 0,
            err: '参数错误'
        })
    }

    let existStar = yield Star.findOne({_id: _id}).exec()

    if(!existStar) {
        return (this.body = {code: 0, err: '该数据不存在'})
    }

    existStar.sex = sex
    existStar.name = name
    existStar.introduction = introduction

    if(existStar.picture === file || !this.request.body.file) {
        yield existStar.save()
        return (this.body = {code: 1, err: 'ok', file: false})
    }

    //进行颜值测试，并返回测试分数。
    let detectData = yield facepp.detectUrl(file)
    if(!detectData) {
        return (this.body = {code:0,err:'detect err'})
    }

    let _face = facepp.findBigestFace(detectData.faces)

    if(!_face) {
        return (this.body = {code:0,err:'人脸识别失败'})
    }

    // adaptive old face old Api
    _face.attribute =_face.attributes
    _face.attribute.smiling =_face.attribute.smile
    _face.face_id = _face.face_token

    let face_token = _face.face_token

    let skin = yield facepp.skincloudtestImg(file)

    let looks = yield facepp.cloudtest(_face)

    //根据国家和明星性别去匹配有没有对应的图库。
    let faceset = yield FaceSet.findOne({name: country, sex: sex}).exec()

    if(!faceset) {
        return (this.body = {code:0,err:'该图片库不存在，请添加图片库'})
    }
    let faceset_token = faceset.faceset_token
    

    if(face_token && faceset_token) {
        yield facepp.delFace(existStar.face_token, faceset_token)

        if(existStar.faceset_token && existStar.faceset_token !== faceset_token) {
            yield facepp.delFace(existStar.face_token, existStar.faceset_token)
        }

        yield facepp.addFace(face_token, faceset_token)
    }

    existStar.picture = file
    existStar.face_token = face_token
    existStar.faceset_token = faceset_token
    existStar.extend = detectData
    existStar.country = {
        name: country
    }
    existStar.faceTest = looks
    existStar.skinTest = skin


    yield existStar.save()

    this.body = {
        code: 1,
        err: 'ok'
    }

}



/**
 * @api {post} /delFaceToFaceSet   删除明星信息
 * @apiName star
 * @apiGroup star
 *
 * @apiParam {String} id          明星id
 * @apiParam {String} pagination    页码
 *
 * @apiExample Example usage:
 * http://test.legle.cc/FaceToFaceSetList
 *
 * @apiSuccess {Number}   code   1.
 * @apiSuccess {String}   err 'ok'.
 */
exports.delFaceToFaceSet = function *(next) {
    let starId = this.query.starId || ''
    if(!starId) {
        return (this.body = {code:0, err: 'starId not found'})
    }

    let star = yield Star.findOne({_id:starId}).exec()
    if(!star) {
        return (this.body = {code:0, err: '该明星已经被删除'})
    }


    let face_token = star.face_token
    let faceset_token = star.faceset_token

    if(!faceset_token && star.country) {
        let country = star.country.name
        let sex = star.sex
        let faceset = yield FaceSet.findOne({name: country, sex: sex}).exec()

        if(faceset) {
            faceset_token = faceset.faceset_token
        }
    }

    if(faceset_token) {    
        yield facepp.delFace(face_token, faceset_token)
    }

    yield star.remove()

    return (this.body = {code:1, err: 'ok'})
}



/**
 * @api {post} /FaceToFaceSetList   获取明星数据
 * @apiName star
 * @apiGroup star
 *
 * @apiParam {String} name          明星名称
 * @apiParam {String} pagination    页码
 *
 * @apiExample Example usage:
 * http://test.legle.cc/FaceToFaceSetList
 *
 * @apiSuccess {Number}   code   1.
 * @apiSuccess {String}   err 'ok'.
 */
exports.FaceToFaceSetList = function *(next) {

    //let number = 15
    //let pagination = Number(this.request.query.pagination) - 1
    let name = this.request.query.name
    let offset = this.request.query.offset
    let limit = this.request.query.limit

    offset = Number(offset)
    limit = Number(limit)

    let result

    let count = yield Star.count().exec()

    if(name) {
        result = yield Star.find({name: name}).exec()
        if(!result) {
            return (
                this.body = {
                    code:1,
                    err: '请输入正确的明星名称'
                }
            )
        }
    } else {
        // result = yield Star.find().skip(offset).limit(offset + limit).sort({'meta.createdAt': -1}).exec()
        result = yield Star.find().skip(offset).limit(limit).exec()
        if(!result) {
            return (
                this.body = {
                    code:1,
                    err: '无明星数据'
                }
            )
        }
    }
    return (
        this.body = {
            code:1,
            count: count,
            rows:result
        }
    )
}


/**
 * @api {post} /starLogin  star  login
 * @apiName Login
 * @apiGroup star members
 *
 * @apiDescription star  user  login.
 *
 * @apiParam {String} username The StarMember-username.
 * @apiParam {String} password The StarMember-password.
 *
 * @apiExample Example usage:
 * http://test.legle.cc/starLogin
 *
 * @apiSuccess {Number}   code   1.
 * @apiSuccess {String}   err 'ok'.
 *
 * @apiError code 0.
 * @apiError err   err message.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *       'code': 0
 *       'error': '用户不存在'
 *     }
 */
exports.Login = function *(next) {
    let body = this.request.body.data
    let username = body.username
    let password = body.password

    const existStarMember = yield StarMember.findOne({username:username}).exec()

    if(!existStarMember) {
        return (this.body = {
            ret: 0,
            errors: {
                msg: Msg.USER.USER_NOT_EXIST
            }
        })
    }

    let match = yield existStarMember.comparePassword(password, existStarMember.password)
    if (!match) {
        return (this.body = {
            code: 0,
            err: Msg.USER.PWD_ERROR
        })
    }

    this.session.StarMember = {
        StarMemberId:existStarMember._id,
        username:existStarMember.username
    }

    this.body = {
        code: 1,
        token: existStarMember._id,
        err: 'ok'
    }
}


/**
 * @api {post} /starRegister  Star register
 * @apiName Star
 * @apiGroup Star
 * @apiPermission anyBody
 *
 * @apiDescription Star register.
 *
 * @apiParam {String} username The star-name.
 * @apiParam {String} password The star-password.
 * @apiParam {String} conformPassword The star-conformPassword.
 *
 * @apiExample Example usage:
 * http://test.legle.cc/starRegister
 *
 * @apiSuccess {Number}   code   1.
 * @apiSuccess {String}   err 'ok'.
 *
 * @apiError code 0.
 * @apiError err   err message.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *       "code": 0
 *       "error": "用户密码不匹配"
 *     }
 */
exports.register = function *(next) {
    let username = this.request.body.username
    let password = this.request.body.password
    let conformPassword = this.request.body.conformPassword

    let existClient = yield StarMember.findOne({username: username}).exec()
    if (existClient) {
        return (this.body = {
            code: 0,
            err: "用户名已存在"
        })
    }
    if (password !== conformPassword) {
        return (this.body = {
            code: 0,
            err: "两次密码输入不一致"
        })
    }

    const updateData = {
        username: username,
        password: password
    }

    const savedClient = new StarMember(updateData)
    yield savedClient.save()

    this.session.StarMember = {
        StarMemberId: savedClient._id,
        username: savedClient.username
    }

    this.body = {
        code: 1,
        clientId: savedClient._id,
        err: 'ok'}
}



/**
 * @api {post} /starSignOut  star sign out  arpt
 * @apiName signOut
 * @apiGroup star
 * @apiPermission star
 *
 * @apiDescription star sign out  arpt.
 *
 * @apiExample Example usage:
 * http://test.legle.cc/starSignOut
 *
 * @apiError code 0.
 * @apiError err   err message
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 200 Ok
 *     {
 *       "code": 0
 *       "error": "用户不存在"
 *     }
 */
exports.signOut = function *(next) {
    this.logout()
    delete this.session.StarMember
    this.body = {
        code:1,
        err: 'ok'
    }
}

