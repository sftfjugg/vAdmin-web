import request from '@/utils/request'

// 查询Releasestg列表
export function listReleasestg(query) {
  return request({
    url: '/api/v1/releasestgList',
    method: 'get',
    params: query
  })
}
