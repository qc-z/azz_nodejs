var koa = require('koa');
var router = require('koa-router');
var bodyParser = require('koa-body');
var app = koa();
//Set up Pug
var Pug = require('koa-pug');
var pug = new Pug({
viewPath: './views',
basedir: './views',
app: app 
});
//Set up body parsing middleware
app.use(bodyParser({
formLimit: '2mb',
formidable:{uploadDir: './uploads'},    //This is where the files would come
multipart: true,
urlencoded: true
}));
var _ = router(); //Instantiate the router
_.get('/files', renderForm);
_.post('/upload', handleForm);
function * renderForm(){
this.render('file_upload');
}
function *handleForm(){
console.log("body: ", this.request);
console.log("Files: ", this.request.body.files);
console.log("Fields: ", this.request.body.fields);
this.body = "Received your data!"; //This is where the parsed request is stored
}
app.use(_.routes());
app.listen(3000);
