import request from '@/utils/request'

// 查询Rid Release列表
export function listReleaserid(query) {
  return request({
    url: '/api/v1/releaseridList',
    method: 'get',
    params: query
  })
}

// 查询Releaserid详细
export function getReleaserid(id) {
  return request({
    url: '/api/v1/releaserid/' + id,
    method: 'get'
  })
}

// 新增Releaserid
export function addReleaserid(data) {
  return request({
    url: '/api/v1/releaserid',
    method: 'post',
    data: data
  })
}

// 修改Releaserid
export function updateReleaserid(data) {
  return request({
    url: '/api/v1/releaserid',
    method: 'put',
    data: data
  })
}

// 删除Releaserid
export function delReleaserid(id) {
  return request({
    url: '/api/v1/releaserid/' + id,
    method: 'delete'
  })
}
