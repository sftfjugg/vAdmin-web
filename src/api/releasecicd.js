import request from '@/utils/request'

// 请求列表
export function requestList(query) {
  return request({
    url: '/api/v1/pageList',
    method: 'get',
    params: query
  })
}

// 查询Releasecicd列表
export function listReleasecicd(query) {
  return request({
    url: '/api/v1/releasecicdList',
    method: 'get',
    params: query
  })
}

// 查询Releasechart列表
export function listReleasechartday(query) {
  return request({
    url: '/api/v1/releasechart/deploybyday',
    method: 'get',
    params: query
  })
}

export function listReleasecharthour(query) {
  return request({
    url: '/api/v1/releasechart/deploybyhour',
    method: 'get',
    params: query
  })
}

// 查询Releasecicd详细
export function getReleasecicd(id) {
  return request({
    url: '/api/v1/releasecicd/' + id,
    method: 'get'
  })
}

// 新增Releasecicd
export function addReleasecicd(data) {
  return request({
    url: '/api/v1/releasecicd',
    method: 'post',
    data: data
  })
}

// 修改Releasecicd
export function updateReleasecicd(data) {
  return request({
    url: '/api/v1/releasecicd',
    method: 'put',
    data: data
  })
}

// 删除Releasecicd
export function delReleasecicd(id) {
  return request({
    url: '/api/v1/releasecicd/' + id,
    method: 'delete'
  })
}
