'use strict'

const mongoose = require('mongoose')
const BeautyProject = mongoose.model('BeautyProject')
// const _ = require('lodash')
const Msg = require('../libs/msg')


/**
 * @api {post} /addProject   添加推荐项目
 * @apiName addProject
 * @apiGroup beautyProject
 * @apiPermission anyBody
 *
 * @apiDescription beautyProject  add project.
 *
 * @apiParam {String} projectType   The projectType.
 * @apiParam {String} projectName   The projectName.
 * @apiParam {String} projectPrice  The projectPrice.
 * @apiParam {String} area      The area.
 *
 * @apiExample Example usage:
 * http://test.legle.cc/addProject
 *
 * @apiSuccess {Number}   code   1.
 * @apiSuccess {String}   err 'ok'.
 *
 * @apiError code 0.
 * @apiError err   err message.
 *
 */
exports.addProject = function *(next) {

    //projectType 1:美唇     2:瘦鼻    3:瘦脸     4:太阳穴       5:纹眉    6:丰下巴    7:丰额   8:苹果肌     9:隆鼻
    //typeName    1:meichun 2:shoubi 3:shoulian 4:taiyangxue 5:wenmei 6:fengxiaba 7:fenge 8:pingguoji 9:longbi
    let projectType = this.request.body.projectType
    let projectName = this.request.body.projectName
    let projectPrice = this.request.body.projectPrice
    let area = this.request.body.area
    let typeName = this.request.body.typeName
    // let clientId =  this.session.client.clientId

    const newData = {
        projectType: projectType,
        projectName: projectName,
        projectPrice: projectPrice,
        typeName:typeName,
        area:area
        // clientId:clientId
    }


    const savedProject = new BeautyProject(newData)
    yield savedProject.save()
    this.body = {
        ret: 1,
        err: Msg.USER.ADD_SUCCESS
    }
}

/**
 * @api {get} /deleteProject   删除推荐项目
 * @apiName deleteProject
 * @apiGroup beautyProject
 * @apiPermission anyBody
 *
 * @apiDescription beautyProject  delete project.
 *
 * @apiParam {String} projectID   The projectID.
 *
 * @apiExample Example usage:
 * http://test.legle.cc/addProject
 *
 * @apiSuccess {Number}   code   1.
 * @apiSuccess {String}   err 'ok'.
 *
 * @apiError code 0.
 * @apiError err   err message.
 *
 */
exports.deleteProject = function *(next) {
     let typeName = this.request.query.typeName
     if(typeName) {
         yield BeautyProject.remove({typeName:typeName}).exec()
     }else{
         return(this.body = {
             ret: 1,
             err: Msg.USER.DELETE_LOSE
         })
     }
     this.body = {
         ret: 1,
         err: Msg.USER.DELETE_SUCCESS
     }
}


/**
 * @api {get} /getProject   获取推荐项目列表
 * @apiName getProject
 * @apiGroup beautyProject
 * @apiPermission anyBody
 *
 * @apiDescription beautyProject  delete project.
 *
 * @apiParam {String} projectId  The projectID.
 *
 * @apiExample Example usage:
 * http://test.legle.cc/getProject
 *
 * @apiSuccess {Number}   code   1.
 * @apiSuccess {String}   err 'ok'.
 *
 * @apiError code 0.
 * @apiError err   err message.
 *
 */
exports.getProjectList = function *(next) {

  console.log(this.query)
  // p
  let content = this.query.content || ''
  let number = this.query.pageNumber || 1
  let skip = (number - 1) * 10
  let query = {}
  let projects
  if(content){
    query.typeName = content
    projects = yield BeautyProject.find(query).exec()
  }else{
    projects = yield BeautyProject.find(query).sort({'meta.createdAt': -1}).skip(skip).limit(10).exec()
  }
  let recordTotal = yield BeautyProject.count(query).exec()
  this.body = {
    ret: 1,
    projects: projects,
    recordTotal: recordTotal,
    err: 'ok'
  }

}

/**
 * @api {get} /getProjectAll   获取所有推荐项目
 * @apiName getProjectAll
 * @apiGroup beautyProject
 * @apiPermission anyBody
 *
 * @apiDescription beautyProject  delete project.
 *
 *
 * @apiExample Example usage:
 * http://test.legle.cc/getProjectAll
 *
 * @apiSuccess {Number}   code   1.
 * @apiSuccess {String}   err 'ok'.
 *
 * @apiError code 0.
 * @apiError err   err message.
 *
 */
exports.getProjectAll = function *(next) {


  let projects = yield BeautyProject.find().exec()
  let recordTotal = yield BeautyProject.count().exec()


  this.body = {
    ret: 1,
    projects: projects,
    recordTotal: recordTotal,
    err: 'ok'
  }

}



/**
 * @api {post} /editProject   编辑推荐项目
 * @apiName editProject
 * @apiGroup beautyProject
 * @apiPermission anyBody
 *
 * @apiDescription beautyProject  edit project.
 *
 * @apiParam {String} projectType   The projectType.
 * @apiParam {String} projectName   The projectName.
 * @apiParam {String} projectPrice  The projectPrice.
 * @apiParam {String} area  The area.
 * @apiParam {String} _id  The _id.
 *
 * @apiExample Example usage:
 * http://test.legle.cc/editProject
 *
 * @apiSuccess {Number}   code   1.
 * @apiSuccess {String}   err 'ok'.
 *
 * @apiError code 0.
 * @apiError err   err message.
 *
 */
exports.editProject = function *(next) {

  if(!this.session.sysMember) {
    return (this.body = {
      ret: 0,
      err: '请先登录'
    })
  }

  let body = this.request.body
  let bodykeys = Object.keys(body)

  let _id = body._id

  let _beautyProject = yield BeautyProject.findOne({_id: _id}).exec()


  if(bodykeys.length > 0 && _beautyProject) {
    for (let i = bodykeys.length - 1; i >= 0; i--) {
      if(body[bodykeys[i]]) {
        _beautyProject[bodykeys[i]] = body[bodykeys[i]]
      }
    }
    yield _beautyProject.save()
  }

  this.body = {
    ret: 1,
    beautyProject: _beautyProject,
    err: 'ok'
  }
}




