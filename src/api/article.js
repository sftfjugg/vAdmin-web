import request from '@/utils/request'

// 查询Article列表
export function listArticle(query) {
  return request({
    url: '/api/v1/articleList',
    method: 'get',
    params: query
  })
}

// 查询Article详细
export function getArticle(articleId) {
  return request({
    url: '/api/v1/article/' + articleId,
    method: 'get'
  })
}

// 新增Article
export function addArticle(data) {
  return request({
    url: '/api/v1/article',
    method: 'post',
    data: data
  })
}

// 修改Article
export function updateArticle(data) {
  return request({
    url: '/api/v1/article',
    method: 'put',
    data: data
  })
}

// 删除Article
export function delArticle(articleId) {
  return request({
    url: '/api/v1/article/' + articleId,
    method: 'delete'
  })
}
