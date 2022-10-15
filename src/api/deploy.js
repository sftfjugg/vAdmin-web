import request from '@/utils/request'

// 查询deployApply列表
export function listDeployList(query) {
  return request({
    url: '/api/v1/applyList',
    method: 'get',
    params: query
  })
}

// 查询deployApply列表
export function listRollList(query) {
  return request({
    url: '/api/v1/rollList',
    method: 'get',
    params: query
  })
}

// 查询DeployApply详细
export function getDeployApply(id) {
  return request({
    url: '/api/v1/deploy/' + id,
    method: 'get'
  })
}

// 修改DeployApply
export function updateDeployApply(data) {
  return request({
    url: '/api/v1/deploy',
    method: 'put',
    data: data
  })
}

// 新增DeployApply
export function addDeployApply(data) {
  return request({
    url: '/api/v1/deploy',
    method: 'post',
    data: data
  })
}

export function deployStart(data) {
  return request({
    url: '/api/v1/deploystart',
    method: 'post',
    data: data
  })
}

export function deployStatusApi(id) {
  return request({
    url: '/api/v1/deploystatus' + id,
    method: 'get'
  })
}
