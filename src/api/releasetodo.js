import request from '@/utils/request'

// 查询Rid Release列表
export function listReleasetodo(query) {
  return request({
    url: '/api/v1/releasetodoList',
    method: 'get',
    params: query
  })
}

// 修改Releasetodo
export function updateReleasetodo(data) {
  return request({
    url: '/api/v1/releasetodo',
    method: 'put',
    data: data
  })
}
