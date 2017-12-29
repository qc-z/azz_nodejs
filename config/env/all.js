'use strict'

var path = require('path')
var rootPath = path.join(__dirname, '/../..')

module.exports = {
  root: rootPath,
  sessionSecret: 'ARPTSHUAIGE',
  port: 4400,
  name: 'arpt',
  hostname: 'azz.leglear.com',
  aliyun: {
    accessKeyId: 'LTAIDACFnyvEfVHn',
    secretAccessKey: 'x9wvJjtxDTznUSvluRqKnTGX0yOTHs',
    endpoint: 'https://sts.aliyuncs.com',
    apiVersion: '2015-04-01',
    arn: 'acs:ram::1071268284005178:role/arpt-user-role',
    ossHost: 'http://azz-test.oss-cn-shenzhen.aliyuncs.com',
    userDir: 'user/',
    faceDir: 'face-test/',
    skinDir: 'skin-test/',
    starDir: 'star-test/',
    starsDir: 'stars/'
  },
  facepp: {
    base_host:'10.0.0.233:3002',
    facepp_apikey:'7ff5eb96615801d7eb7bbfb43f4019d8',
    facepp_apisecret:'Bqm77UYAGL0tLEKCzorLOEzW2WZHvdUp',
    facepp_apiurl:'https://apicn.faceplusplus.com/v2',

    //收费
    faceppv3_apikey:'2Fk7AW94itM4RC8Bgn0HJP4NhC2jIJ5o',
    faceppv3_apisecret:'yz855SYnojZ7EPbzWTcgcEcNnhvyY0h2',
    faceppv3_apiurl:'https://api-cn.faceplusplus.com/facepp/v3'
  },
  countrys: {
    1: '中国',
    2: '韩国',
    3: '马来西亚',
    4: '美国',
    5: '新加坡'
  },
  toolTypes: {
      1: '颜值测试',
      2: '皮肤测试',
      3: '明星面对面'
  },
  jwt: {
    JWTKEY: 'arpt2017',
    tokenTime: 30,
    type: 'days',
    adminTokenTime: 24,
    adminTokenDay: 'hours'
  },
  log4js_config: {
    appenders: [
      {type: 'console'},//控制台输出
      {
          type: 'dateFile',//文件输出
          filename: __dirname + '/../logs/arpt.log',
          pattern: '-yyyy-MM-dd',
          maxLogSize: 20480,
          alwaysIncludePattern: false
      }
    ],
    replaceConsole: true
  },
  sockeChat: {
    url: 'http://localhost:4000/creatClient'
  },
  starFaceSetImg: 'http://120.132.68.45:3004/public/images/star/',
  starFaceSet: {
    url: 'http://120.132.68.45:3004/star/listPage',
    body: {
      appid: 'webadmin',
      core: {},
      data: {
        offset: 0,
        limit: 15
      },
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBpZCI6IndlYmFkbWluIiwidXNlcmlkIjoiMDAyIiwiYWNjb3VudCI6ImxlZ2xlIiwibmFtZSI6bnVsbCwiaWF0IjoxNDk0OTMyNDYwfQ.1aNAyqK6WAhQPJI81UAVuoERxQjjFaZ0HXhbk8lcZV0'
    }
  },
  faceSetChina: 'a32348db6dbeac3313f99281085baeb0',
  faceSetChinaWomen: 'c0a3b128d279ca3246a3d21f5549f84f',
  faceSetChinaMan: 'cac5debad938fc4984d28fd6106d683a',
  faceSetHanguo: '06b358388fd67e95f3bfdc9abd917966',
  faceSetHanguoMan: '67074c8e9185ac81fa592f9e0db439ab',
  faceSetHanguoWomen: '05a3e1c1c5b68ddb4397d301d0487b30'
}
