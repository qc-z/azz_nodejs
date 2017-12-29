'use strict'

// const path = require('path')
const mongoose = require('mongoose')
const Client = mongoose.model('Client')
const logger = require('koa-logger')
const json = require('koa-json')
const compress = require('koa-compress')
const lusca = require('koa-lusca')
const Router = require('koa-router')
const session = require('koa-session')
// const platform = require('platform')
const cors = require('koa-cors')
// const moment = require('moment')
const router = new Router()
const bodyParser = require('koa-bodyparser')
const xmlParser = require('koa-xml-body').default
// const minify = require('html-minifier')
const passport = require('koa-passport')
// const views = require('koa-views')
const serve = require('koa-static')
const errors = require('../app/errors/middleware')
// const packageJson = require('../package.json')

module.exports = function(app, config) {
  // if (config.env == 'development') app.use(logger())
  app.use(logger())
  app.use(errors.error())
  app.use(json({pretty: false, param: 'pretty'}))

  app.name = config.name
  app.env = config.env

  app.use(serve('./public'))
  app.use(serve('../www'))
  app.use(xmlParser())
  app.use(bodyParser())

  app.keys = ['sea', 'youtomorrow']
  app.use(session({maxAge: 8640000000,}, app))

  app.use(lusca({
    // csrf: {
    //   key: '_csrf',
    //   secret: 'BANRUOSHENG'
    // },
    csrf: false,
    csp: {},
    xframe: 'SAMEORIGIN',
    p3p: 'ABCDEF',
    hsts: {maxAge: 31536000, includeSubDomains: true},
    xssProtection: true
  }))

  app.use(cors({credentials: true}))

  // app.use(views(path.resolve(__dirname, '../app/views'), {
  //   extension: 'jade',
  //   locals: {
  //     version: packageJson.version,
  //     online: config.online,
  //     moment: moment,
  //     appName: config.app.name
  //   }
  // }))

  app.use(passport.initialize())
  app.use(passport.session())
  require('./passport')(passport)
  app.use(function *(next) {
    var client = this.session.client

    if (client && client._id) {
      this.session.client = yield Client.findOne({_id: client._id}).exec()
      this.state.client = this.session.client
    }
    else {
      this.state.client = null
    }

    yield next
  })

// 获取平台信息
  // app.use(function *(next) {
  //   var info = platform.parse(this.headers['user-agent'])
  //   var brand = (info.name || '').toUpperCase()
  //   var version = Number(info.version)
  //   var isIE = this.query.isfuckIE

  //   if (isIE) {
  //     yield this.render('static/fuckie')

  //     return
  //   }

    // var edm = this.query.edm
    // if (edm) {
    //   yield this.render('edm/' + edm, {
    //     email: 'ddd',
    //     name: 'ccc',
    //     user: {},
    //     checker: {},
    //     payment: {}
    //   })

    //   return
    // }

  //   if (brand === 'IE' && version <= 8) {
  //     yield this.render('static/fuckie')

  //     return
  //   }

  //   yield *next
  // })


  require('./routes')(router, passport)

  app.use(errors.error())

  app
    .use(router.routes())
    .use(router.allowedMethods())

  app.use(compress({
    filter: function (content_type) {
      return /text/i.test(content_type)
    },
    threshold: 2048,
    flush: require('zlib').Z_SYNC_FLUSH
  }))

  // 对 Html 进行压缩处理
  // app.use(function *minifyHTML(next) {
  //   yield next

  //   if (!this.response.is('html')) return

  //   var body = this.body

  //   if (!body || body.pipe) return

  //   if (Buffer.isBuffer(body)) {
  //     body = body.toString()
  //   }

  //   this.body = minify(body)
  // })
}
