/**
 * 路由
 */

const router = require('koa-router')()
const userModel = require('../model/user')
const commentModel = require('../model/comment')
const articleModel = require('../model/article')

/**
 * 登录
 */
router.post('/login', async (ctx) => {
  const postData = ctx.request.body
  // 获取 referer 判断
  const referer = ctx.request.header.referer
  // 符合的才执行
  if (/^https?:\/\/localhost:3000/.test(referer)) {
    //操作
    if (userModel.isSystemUser(postData.username, postData.password)) {
      // 设置登陆态cookie
      userModel.setUserCookie(postData.username, ctx)
      // 登陆成功
      ctx.body = {
        success: true,
        retcode: 0,
      }
    } else {
      // 登陆失败
      ctx.body = {
        success: false,
        message: '没有该用户',
      }
    }
  } else {
    // 返回结果
    ctx.body = {
      success: false,
      mesage: 'referer 不正确',
    }
  }
})

/**
 * 登出
 */
router.post('/logout', async (ctx) => {
  const postData = ctx.request.body
  const user = userModel.checkUserByCookie(ctx)
  if (user) {
    userModel.clearUserCookie(ctx)
    ctx.body = {
      success: true,
      retcode: 0,
    }
  } else {
    // 登陆失败
    ctx.body = {
      success: false,
      message: '没有登录',
    }
  }
})

/**
 * 增加评论
 */
router.post('/add_comment', async (ctx) => {
  let postData = ctx.request.body
  // 判断是否是登陆了
  const user = userModel.checkUserByCookie(ctx)
  const articleId = postData.articleId
  // 获取 referer 判断
  const referer = ctx.request.header.referer
  // 检验token
  const postToken = postData.token  // 用户提交的 token
  const serverToken = userModel.getUserToken(user.username, ctx) // 服务器算的token
  const isTrueToken = postToken === serverToken
  if (isTrueToken) {
    // 符合的才执行
    if (/https?:\/\/localhost:3000/.test(referer)) {
      //操作
      if (user && articleId) {
        // 增加评论
        commentModel.addComments(articleId, {
          comment: postData.comment,
          date: +postData.date,
          author: user.username,
          avatar: user.avatar,
        })
        // 返回结果
        ctx.body = {
          success: true,
          retcode: 0,
          list: commentModel.getCommentById(articleId),
        }
      } else {
        ctx.body = {
          success: false,
          retcode: -1,
          message: '没有登陆',
        }
      }
    } else {
      // 返回结果
      ctx.body = {
        success: false,
        mesage: 'referer 不正确',
      }
    }
  } else {
    // 返回结果
    ctx.body = {
      success: false,
      mesage: 'token 不正确',
    }
  }

})

/**
 * 获取用户信息
 */
router.get('/get_userinfo', async (ctx) => {
  const user = userModel.checkUserByCookie(ctx)
  if (user) {
    ctx.body = {
      is_login: true,
      username: user.username,
      avatar: user.avatar,
    }
  } else {
    ctx.body = {
      is_login: false,
    }
  }
})

/**
 * 获取用户的评论信息
 */
router.get('/get_article_comment', async (ctx) => {
  // 判断是否是登陆了
  const articleId = ctx.query.articleId
  const comments = commentModel.getCommentById(articleId)

  ctx.body = {
    success: true,
    list: comments,
  }
})

/**
 * 获取文章列表
 */
router.get('/get_articles', async (ctx) => {
  ctx.body = {
    success: true,
    articles: articleModel.getArticles(),
  }
})

/**
 * 获取文章详情
 */
router.get('/get_article_detail', async (ctx) => {
  // 获取文章 id
  const id = +ctx.query.id
  ctx.body = {
    success: true,
    detail: articleModel.getArticleById(id),
  }
})

module.exports = router
