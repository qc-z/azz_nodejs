'use strict'

var mongoose = require('mongoose')
var config = require('./config')
var User = mongoose.model('User')
var Usercoupon = mongoose.model('Usercoupon')
var WeixinStrategy = require('passport-weixin').Strategy

module.exports = function(passport) {

  passport.serializeUser(function(profile, done) {
    done(null, profile.openid)
  })

  passport.deserializeUser(function(openid, done) {
    done(null, {openid: openid})
  })

  var wechatCf = config.wechat


  // 优惠卷 微信 h5 活动
  passport.use('wxcoupon',new WeixinStrategy({
    clientID: wechatCf.appID
    , clientSecret: wechatCf.appSecret
    , callbackURL: wechatCf.callbackURLCoupon
    , requireState: false
    , authorizationURL: 'https://open.weixin.qq.com/connect/oauth2/authorize' //[公众平台-网页授权获取用户基本信息]的授权URL 不同于[开放平台-网站应用微信登录]的授权URL 
    , scope: 'snsapi_base' //[公众平台-网页授权获取用户基本信息]的应用授权作用域 不同于[开放平台-网站应用微信登录]的授权URL 
  }, function(accessToken, refreshToken, profile, done) {
    profile = profile._json
    return done(null, profile)
  }))
}
