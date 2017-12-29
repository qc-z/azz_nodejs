'use strict'

const _ = require('lodash')
const Promise = require('bluebird')
const request = require('request-promise')
const qs = require('querystring')
const fs = require('fs')
const path = require('path')
const gm = require('gm').subClass({GraphicsMagick: true})
const config = require('../../config/config')
// const apiurl=config.facepp.facepp_apiurl
const _pack={
    api_key:config.facepp.faceppv3_apikey
    ,api_secret:config.facepp.faceppv3_apisecret
}

const facepp={}

// gm 旋转手机拍照的照片
facepp.gm = function (filePath) {
	return new Promise(function(resolve, reject) {
		filePath = path.join(__dirname, '../../', filePath)
		gm(filePath).autoOrient().write(filePath,function(err) {
        if (err) {
            console.log(err)
            reject(Error('get stars face set error'))
        }
        else {
        	resolve(true)
        }
    })
	})
}


//获取明星集合
facepp.getStars = function (reqBody) {
	return new Promise(function(resolve, reject) {
		let url = 'http://120.132.68.45:3004/star/listPage'
	    request({
	        uri:url,
	        json:reqBody,
	        method:'post'
	    })
	    .then(function (body) {
	        resolve(body)
	    })
	    .catch(function(err) {
	    	console.error(err)
	    	reject(Error('get stars face set error'))
	    })
	})
}


//creat socketio chat client
facepp.creatChat  = function (clientId) {
	return new Promise(function(resolve, reject) {
	    request(config.sockeChat.url + '?clientId=' + JSON.stringify(clientId))
	    .then(function (body) {
	        resolve(body)
	    })
	    .catch(function(err) {
	    	console.error(err)
	    	reject(Error('remote create facetest server unavailable'))
	    })
	})
}


//自家的人脸颜值分析
facepp.cloudtest = function (face) {
	return new Promise(function(resolve, reject) {

	    const FaceResult = {
	        w:face.face_rectangle.width,
	        h:face.face_rectangle.height,
	        face:face
	    }

	    request({
	    	// uri:'http://106.75.99.42:8080/CloudTesting/getLooks',
	        uri:'http://localhost:8083/',
	        json:FaceResult,
	        method:'post'
	    })
	    .then(function (body) {
	    	if(typeof body === 'string') {
	    		reject(Error('图片无法解析'))
	    	}
	        resolve(body)
	    })
	    .catch(function(err) {
	    	console.error(err)
	    	reject(Error('remote facetest server unavailable'))
	    })
	})
}

//自家的皮肤分析 // 旧接口 整个图片 上传
facepp.skincloudtest = function (options) {
    //测试
    return new Promise(function(resolve, reject) {
	    if(options==null) {
	        reject(Error('options is not allow null！'))
	    }
	    request.post('http://106.75.99.42:8081/SkinCloudTesting/SkinCloudTesting/',{
	        formData:{
	            file:{
	                value: fs.createReadStream(options.file.path),
	                options: {
	                    filename: options.file.name,
	                    contentType: options.file.type
	                }
	            }
	        }
	    })
	    .then(function (body) {
	        resolve(JSON.parse(body))
	    })
	    .catch(function(err) {
	    	console.error(err)
	    	reject(Error('remote facetest server unavailable'))
	    })
    })
}

//用 图片地址 免下载测试
facepp.skincloudtestImg = function (image_url) {
    //测试
    return new Promise(function(resolve, reject) {
	    request.post('http://106.75.99.42:8081/SkinCloudTesting/SkinCloudTestingUrl/',{
	        formData:{
	            // file:{
	            //     value: fs.createReadStream(options.file.path),
	            //     options: {
	            //         filename: options.file.name,
	            //         contentType: options.file.type
	            //     }
	            // }
	            urlImg: image_url
	        }
	    })
	    .then(function (body) {
	        resolve(JSON.parse(body))
	    })
	    .catch(function(err) {
	    	console.error(err)
	    	reject(Error('remote facetest server unavailable'))
	    })
    })
}

//自家的皮肤分析 url
facepp.skincloudtestUrl = function (fileUrl) {
    //测试
    return new Promise(function(resolve, reject) {
	    if(fileUrl==null) {
	        reject(Error('fileUrl is not allow null！'))
	    }

	    var fileName = fileUrl.split('star/')[1]
	    var type = fileUrl.split('.')[4]
	    var locaFile = 'public/star/' + fileName
	    request.post('http://106.75.99.42:8081/SkinCloudTesting/SkinCloudTesting/',{
	        formData:{
	            file:{
	                value: fs.createReadStream(locaFile),
	                options: {
	                    filename: fileName,
	                    contentType: type
	                }
	            }
	        }
	    })
	    .then(function (body) {
	        resolve(JSON.parse(body))
	    })
	    .catch(function(err) {
	    	console.error(err)
	    	reject(Error('remote facetest server unavailable'))
	    })
    })
}

// 人脸识别
facepp.detect = function (options) {
	console.log(options)
	return new Promise(function(resolve, reject) {
	    if(options==null) {
	    	reject(Error('options is not allow null！'))
	    }
	    // console.log('image_url####', config.SITE_ROOT_URL + options.file.path.replace('public', ''))
	    request.post(config.facepp.faceppv3_apiurl+'/detect?'+qs.stringify(_.extend({return_landmark:1,return_attributes:'gender,age,smiling,headpose,facequality,blur,eyestatus,ethnicity'},_pack)),{
	        formData:{
	            image_file:{
	                value: fs.createReadStream(options.file.path),
	                options: {
	                    filename: options.file.name,
	                    contentType: options.file.type
	                }
	            }
	            // image_url: config.SITE_ROOT_URL + options.file.path.replace('public', '')
	        }
	    })
	    .then(function(body) {
	        resolve(JSON.parse(body))
	    })
	    .catch(function(err) {
	    	console.error(err)
	    	reject(Error('remote facetest server unavailable'))
	    })
	})
}

// 用图片地址直接检测
facepp.detectUrl = function (image_url) {
	let objOpt = {
		image_url: image_url,
		return_landmark:1,
		return_attributes: 'gender,age,smiling,headpose,facequality,blur,eyestatus,ethnicity'
	}
	_.extend(objOpt, _pack)
	let form = {
		form: objOpt
	}
	return new Promise(function(resolve, reject) {
	    request.post(config.facepp.faceppv3_apiurl+'/detect', form)
	    .then(function (body) {
	        resolve(JSON.parse(body))
	    })
	    .catch(function(err) {
	    	console.error(err)
	    	reject(Error('remote search facetest server unavailable'))
	    })
	})
}

// get face detail
// https://api-cn.faceplusplus.com/facepp/v3/face/getdetail
facepp.getFaceDetail = function (options) {
	let objOpt = {
		face_token: face_token,
		faceset_token: faceset_token
	}
	_.extend(objOpt, _pack)
	let form = {
		form: objOpt
	}
	return new Promise(function(resolve, reject) {
	    request.post(config.facepp.faceppv3_apiurl+'/face/getdetail', form)
	    .then(function (body) {
	        resolve(JSON.parse(body))
	    })
	    .catch(function(err) {
	    	console.error(err)
	    	reject(Error('remote search facetest server unavailable'))
	    })
	})
}


// createFaceset
// outer_id 是 本地 faceset 表的 _id
// https://api-cn.faceplusplus.com/facepp/v3/faceset/create
facepp.createFaceset  = function (display_name) {
	let objOpt = {
		display_name: display_name
	}
	_.extend(objOpt, _pack)
	let form = {
		form: objOpt
	}
	return new Promise(function(resolve, reject) {
	    request.post(config.facepp.faceppv3_apiurl+'/faceset/create', form)
	    .then(function (body) {
	        resolve(JSON.parse(body))
	    })
	    .catch(function(err) {
	    	console.error(err)
	    	reject(Error('remote search facetest server unavailable'))
	    })
	})
}

// https://api-cn.faceplusplus.com/facepp/v3/search
facepp.searchFaceset  = function (face_token, faceset_token) {
	let objOpt = {
		face_token: face_token,
		return_result_count: 5,
		faceset_token: faceset_token
	}
	_.extend(objOpt, _pack)
	let form = {
		form: objOpt
	}
	return new Promise(function(resolve, reject) {
	    request.post(config.facepp.faceppv3_apiurl+'/search', form)
	    .then(function (body) {
	        resolve(JSON.parse(body))
	    })
	    .catch(function(err) {
	    	console.error(err)
	    	reject(Error('remote search facetest server unavailable'))
	    })
	})
}

// https://api-cn.faceplusplus.com/facepp/v3/search
facepp.compare  = function (face_token1, face_token2) {
	let objOpt = {
		face_token1: face_token1,
		face_token2: face_token2
	}
	_.extend(objOpt, _pack)
	let form = {
		form: objOpt
	}
	return new Promise(function(resolve, reject) {
	    request.post(config.facepp.faceppv3_apiurl+'/compare', form)
	    .then(function (body) {
	    		let bodys
	    		try{
	    			bodys = JSON.parse(body)
	    		}
	    		catch(errors) {
	    			bodys = body
	    		}
	    		if(bodys.confidence > 80) {
	        	resolve(true)
	    		}
	    		else {
	    			resolve(false)
	    		}
	    })
	    .catch(function(err) {
	    	console.error(err)
	    	reject(Error('remote compare facetest server unavailable'))
	    })
	})
}


// add face to Faceset`
// https://api-cn.faceplusplus.com/facepp/v3/faceset/addface
facepp.addFace  = function (face_token, faceset_token) {
	let objOpt = {
		face_tokens: face_token,
		faceset_token: faceset_token
	}
	_.extend(objOpt, _pack)
	let form = {
		form: objOpt
	}
	return new Promise(function(resolve, reject) {
	    request.post(config.facepp.faceppv3_apiurl+'/faceset/addface', form)
	    .then(function (body) {
	        resolve(JSON.parse(body))
	    })
	    .catch(function(err) {
	    	console.error(err)
	    	reject(Error(err.error_message))
	    })
	})
}

// del face to Faceset
// https://api-cn.faceplusplus.com/facepp/v3/faceset/removeface
facepp.delFace  = function (face_token, faceset_token) {
	let objOpt = {
		face_tokens: face_token,
		faceset_token: faceset_token
	}
	_.extend(objOpt, _pack)
	let form = {
		form: objOpt
	}
	return new Promise(function(resolve, reject) {
	    request.post(config.facepp.faceppv3_apiurl+'/faceset/removeface', form)
	    .then(function (body) {
	        resolve(JSON.parse(body))
	    })
	    .catch(function(err) {
	    	console.error(err)
	    	reject(Error(err.error_message))
	    })
	})
}

// del Faceset
// https://api-cn.faceplusplus.com/facepp/v3/faceset/delete
facepp.delFaceSet  = function (faceset_token) {
	let objOpt = {
		faceset_token: faceset_token
	}
	_.extend(objOpt, _pack)
	let form = {
		form: objOpt
	}
	return new Promise(function(resolve, reject) {
	    request.post(config.facepp.faceppv3_apiurl+'/faceset/delete', form)
	    .then(function (body) {
	        resolve(JSON.parse(body))
	    })
	    .catch(function(err) {
	    	console.error(err)
	    	reject(Error(err.error_message))
	    })
	})
}

// get Faceset detail
// https://api-cn.faceplusplus.com/facepp/v3/faceset/getdetail
facepp.getFaceSetDetail  = function (faceset_token) {
	let objOpt = {
		faceset_token: faceset_token
	}
	_.extend(objOpt, _pack)
	let form = {
		form: objOpt
	}
	return new Promise(function(resolve, reject) {
	    request.post(config.facepp.faceppv3_apiurl+'/faceset/getdetail', form)
	    .then(function (body) {
	        resolve(JSON.parse(body))
	    })
	    .catch(function(err) {
	    	console.error(err)
	    	reject(Error(err.error_message))
	    })
	})
}

// get Faceset list
// https://api-cn.faceplusplus.com/facepp/v3/faceset/getfacesets
facepp.getFacesetList  = function (faceset_token) {
	let objOpt = {
		faceset_token: faceset_token
	}
	_.extend(objOpt, _pack)
	let form = {
		form: objOpt
	}
	return new Promise(function(resolve, reject) {
	    request.post(config.facepp.faceppv3_apiurl+'/faceset/getfacesets', form)
	    .then(function (body) {
	        resolve(JSON.parse(body))
	    })
	    .catch(function(err) {
	    	console.error(err)
	    	reject(Error(err.error_message))
	    })
	})
}


facepp.findBigestFace = function (faces) {
  var face
  for(var i in faces)
  {
    if(face==null)
    {
       face=faces[i]
    }
    else
    {
      if(faces[i].face_rectangle.width>=face.face_rectangle.width&&faces[i].face_rectangle.height>=face.face_rectangle.height)
      {
         face=faces[i]
      }
    }
  }
  return face
}


module.exports = facepp
