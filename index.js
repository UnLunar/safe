const Koa = require('koa');
const fs = require('fs');
const path = require('path');
const router = require('./routers/index');
const bodyParser = require('koa-bodyparser');
const static = require('koa-static');
const ratelimit = require('koa-ratelimit');

// 静态资源目录对于相对入口文件index.js的路径
const staticPath = './static'
const app = new Koa();

// 使用ctx.body解析中间件
app.use(bodyParser());

// 设置静态目录
app.use(static(
  path.join( __dirname,  staticPath)
));

// 设置router
app.use(router.routes()).use(router.allowedMethods());

app.use(ratelimit({
  duration: 60000,
  errorMessage: 'Sometimes You Just Have to Slow Down.',
  id: (ctx) => ctx.ip,
  headers: {
    remaining: 'Rate-Limit-Remaining',
    reset: 'Rate-Limit-Reset',
    total: 'Rate-Limit-Total'
  },
  max: 100,
  disableHeader: false,
}));


app.listen(3000, () => {
    console.log('website is starting at port 3000');
});
