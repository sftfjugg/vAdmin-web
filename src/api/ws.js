import request from '@/utils/request'

export function unWsLogout(id, group) {
  return request({
    url: '/wslogout/' + id + '/' + group,
    method: 'get'
  })
}
