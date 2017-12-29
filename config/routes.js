'use strict'

const User = require('../app/controllers/users')
const Client = require('../app/controllers/clients')
const StarTest = require('../app/controllers/star-test')
const FaceTest = require('../app/controllers/face-test')
const Sysmember = require('../app/controllers/sys-members')
const Beautyroject = require('../app/controllers/beautyProject')
const Operation = require('../app/controllers/operation')
const Case = require('../app/controllers/case')
const Timeprice = require('../app/controllers/timeprice')
const Coupon = require('../app/controllers/coupon')
const Star = require('../app/controllers/star')
const Apk = require('../app/controllers/apk')
const Hotload = require('../app/controllers/hotload')
const Price = require('../app/controllers/price')
const Weixin = require('../app/controllers/weixin')
const Eyebrow = require('../app/controllers/eyebrow')

module.exports = function(router, passport) {


    router.post('/weixin/share', Weixin.share)
    // user
    router.get('/sendVerifyCode', User.sendVerify)
    router.post('/pcVerifyMobile', User.pcVerifyMobile)
    router.get('/test', User.index)
    router.post('/test', User.test)
    router.get('/azz', User.azz)
    router.post('/azz', User.azzP)
    router.get('/getStarsToken', User.getStarsToken) // 获取明星图片库 oss token
    router.get('/getSts', User.getSts)
    router.get('/getStsQc', User.getStsQc)
    router.post('/userCodeLogin', User.userCodeLogin)
    router.post('/userLogin', User.userLogin)
    router.post('/newPassword', User.newPassword)
    router.post('/updatePassword', User.updatePassword)
    router.post('/forgetPassword', User.forgetPassword)
    router.post('/redpackMobile', User.redpackMobile)
    router.get('/redpacks', User.redpacks)
    router.post('/redpackStatus', User.redpackStatus)

    // Client
    router.post('/clientSignupPhone', Client.signupPhone)
    router.post('/editInfo', Client.editInfo)
    router.get('/getRecommend', Client.getRecommend)
    router.get('/getRecommendArr', Client.getRecommendArr)
    router.get('/creatChat', Client.creatChat)
    router.get('/clientGetInfo', Client.getInfo)
    router.post('/clientImg', Client.uploadImg)

    router.post('/addVideo', Client.addVideo)
    router.get('/getVideo', Client.getVideo)
    router.post('/addCarousel', Client.addCarousel)
    router.get('/getCarousel', Client.getCarousel)
    router.get('/deleteCarousel', Client.deleteCarousel)
    router.get('/getLoginState', Client.getLoginState)
    


    router.get('/exportExel', Client.exportExel)

    //apk
    router.get('/getApk', Apk.getApk)
    router.get('/getApkList', Apk.getApkList)
    router.post('/latestVersion', Apk.latestVersion)
    router.post('/editApk', Apk.editApk)
    router.post('/addApk', Apk.addApk)
    router.post('/apkInfo', Apk.apkInfo)


    // hotload
    router.post('/hotloadInfo', Hotload.hotloadInfo)
    router.get('/getHotloadList', Hotload.getHotloadList)
    router.post('/editHotload', Hotload.editHotload)
    router.post('/addHotload', Hotload.addHotload)

      //CLient(ljx)
    router.post('/clientLogin', Client.Login)
    router.post('/clientUpdatePassword', Client.updatePassword)
    router.post('/clientSignOut', Client.signOut)
    router.post('/clientGetBackPassword', Client.getBackPassword)
    router.get('/clientDeleteTestData', Client.deleteTestData)
    router.get('/clientGetCountData', Client.getCountData)

    router.post('/addAdvertisement', Client.addAdvertisement)
    router.get('/getAdvertisementList', Client.getAdvertisementList)
    router.get('/getAdvertisements', Client.getAdvertisements)
    router.get('/deleteAdvertisement', Client.deleteAdvertisement)
    router.post('/editAdvertisement', Client.editAdvertisement)
    router.get('/pcAds', Client.pcAds)
    router.get('/sysAds', Client.sysAds)
    router.get('/clientAds', Client.clientAds)
    
    //addTemplate
    router.post('/addTemplate', Client.addTemplate)
    router.get('/getTemplate', Client.getTemplate)
    router.get('/deleteTemplate', Client.deleteTemplate)
    

      //project
    router.post('/addProject', Beautyroject.addProject)
    router.post('/editProject', Beautyroject.editProject)
    router.get('/delProject', Beautyroject.deleteProject)
    router.get('/getProject', Beautyroject.getProjectList)
    router.get('/getProjectAll', Beautyroject.getProjectAll)

    // operation
    router.post('/addOperation', Operation.add)
    router.post('/editOperation', Operation.edit)
    router.get('/getOperation', Operation.info)
    router.post('/delOperation', Operation.del)

      // case
    router.post('/addCase', Case.add)
    router.post('/editCase', Case.edit)
    router.get('/getCase', Case.info)
    router.post('/delCase', Case.del)
    router.get('/cases', Case.cases)

      // client
    router.post('/addClient', Client.add)
    router.post('/editClient', Client.edit)
    router.post('/delClient', Client.del)
    router.get('/getClient', Client.getClient)

      // timeprice
    router.post('/addTimeprice', Timeprice.add)
    router.post('/editTimeprice', Timeprice.edit)
    router.get('/getTimeprice', Timeprice.info)
    router.post('/delTimeprice', Timeprice.del)
    router.get('/timeprices', Timeprice.timeprices)

      // ccoupon game
    router.post('/addCoupon', Coupon.add)
    router.post('/editCoupon', Coupon.edit)
    router.get('/getCoupon', Coupon.info)
    router.post('/delCoupon', Coupon.del)
    router.get('/coupons', Coupon.coupons)
    router.get('/coupon', Coupon.test)
    router.post('/couponMobile', Coupon.couponMobile)
    router.get('/win', Coupon.win)
    router.post('/myCoupon', Coupon.myCoupon)


      // sys member
    router.get('/getClientInfo', Sysmember.getClientInfo)
    router.post('/getClientList', Sysmember.getClientList)
    router.post('/setSkinRole', Sysmember.setSkinRole)
    router.post('/setFaceRole', Sysmember.setFaceRole)
    router.post('/setStarRole', Sysmember.setStarRole)
    router.post('/sysSignupPhone', Sysmember.signupPhone)
    router.post('/sysLogin', Sysmember.Login)
      router.post('/sysSignOut', Sysmember.signOut)

       //sys（ljx）
    router.get('/setGetClientList', Sysmember.getClientList)
    router.get('/setGetClientInfo', Sysmember.getClientInfo)

    // face test
    // router.post('/getFace', upload.single('file'), FaceTest.getFace)
    router.get('/faceaa', FaceTest.faceaa)
    router.get('/lookTest', FaceTest.getTest)
    router.post('/lookTestUrl', FaceTest.lookTestUrl) // 颜值图片 URL 测试
    
    router.get('/testdata', FaceTest.testdata) 


    // router.post('/getStar', upload.single('file'), FaceTest.getFace)
    router.post('/starTestUrl', StarTest.starTestUrl) // 明星面对面图片url 测试
    router.get('/starTest', StarTest.getStarTest) // 获取明星面对面测试
    router.post('/pcVerifyMobile', User.pcVerifyMobile) // pc 明星面对面的手机验证

      //star(ljx)
    router.post('/creatFaceSet', Star.creatFaceSet)
    router.get('/delFaceSet', Star.delFaceSet)
    router.get('/faceSetList', Star.faceSetList)
    router.get('/faceCountryList', Star.faceCountryList)

    router.post('/addFaceToFaceSet', Star.addFaceToFaceSet)
    router.post('/editFaceToFaceSet', Star.editFaceToFaceSet)
    router.get('/delFaceToFaceSet', Star.delFaceToFaceSet)
    router.get('/FaceToFaceSetList', Star.FaceToFaceSetList)

    router.post('/starRegister', Star.register)
    router.post('/starLogin', Star.Login)
    router.get('/starSignOut', Star.signOut)

    // eyebrow.js
    router.post('/eyebrowTest', Eyebrow.eyebrowTest)
    router.post('/eyebrowSave', Eyebrow.eyebrowSave)
    router.get('/eyebrowGet', Eyebrow.eyebrowGet)

    //price
    router.post('/addPrice', Price.add)
    router.post('/editPrice', Price.edit)
    router.post('/delPrice', Price.del)
    router.get('/getPrice', Price.info)
}



