import qs from 'querystring'

export const FETCH_POSTS = 'FETCH_POSTS'

export function fetchPosts (opts) {
  let { subject, id, limit, offset, type, sort, search, cacheId } = opts
  if (!offset) offset = 0
  let payload = {api: true}
  let querystring = qs.stringify({offset, limit, type, sort, search})

  switch (subject) {
    case 'community':
      payload.path = `/noo/community/${id}/posts`
      break
    case 'person':
      payload.path = `/noo/user/${id}/posts`
      break
    case 'all-posts':
      payload.path = `/noo/user/${id}/all-community-posts`
      break
    case 'followed-posts':
      payload.path = `/noo/user/${id}/followed-posts`
      break
  }

  payload.path += '?' + querystring

  let cache = {id: cacheId, bucket: 'postsByQuery', limit, offset, array: true}
  return {type: FETCH_POSTS, payload, meta: {cache}}
}
