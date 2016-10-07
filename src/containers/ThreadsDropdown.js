import React from 'react'
import { connect } from 'react-redux'
import { find } from 'lodash'
import { map } from 'lodash/fp'
import cx from 'classnames'
import { threadUrl } from '../routes'
import { FETCH_POSTS, markThreadRead, showDirectMessage } from '../actions'
import { fetchPosts } from '../actions/fetchPosts'
import { getComments, getPost, denormalizedPost } from '../models/post'
const { func, object } = React.PropTypes
import A from '../components/A'
import { NonLinkAvatar } from '../components/Avatar'
import Dropdown from '../components/Dropdown'
import Icon from '../components/Icon'

export const ThreadsDropdown = connect(
  (state, props) => {
    return {
      threads: map(id => {
        const post = getPost(id, state)
        return {
          ...denormalizedPost(post, state),
          comments: getComments(post, state)
        }
      }, state.postsByQuery.threads),
      pending: state.pending[FETCH_POSTS]
    }
  }
)(props => {
  const { threads, dispatch, pending, newCount } = props
  return <Dropdown alignRight rivalrous='nav' className='thread-list'
    onFirstOpen={() => dispatch(fetchPosts({ cacheId: 'threads', subject: 'threads' }))}
    toggleChildren={<span>
      <Icon name='Message-Smile'/>
      {newCount > 0 && <div className='badge'>{newCount}</div>}
    </span>}>
    {!pending && <li className='top'>
      <div className='newMessage' onClick={() => dispatch(showDirectMessage())}>
        <Icon name='Compose'/><span className='button-text'>New Message</span>
      </div>
    </li>}
    {pending && <li className='loading'>Loading...</li>}
    {threads.slice(0, 20).map(thread => <li key={thread.id}>
      <Thread thread={thread}/>
    </li>)}
  </Dropdown>
})

const Thread = ({ thread, latestComment }, { currentUser, dispatch }) => {
  const comment = thread.comments[0]
  const lastRead = find(currentUser.last_reads, l => l.post_id === thread.id.toString())
  const unread = comment && lastRead && new Date(lastRead.last_read_at) < new Date(comment.created_at)
  const { followers } = thread
  const follower = followers.find(f => f.id !== currentUser.id)
  if (!comment || !follower) return null

  return <A to={threadUrl(thread.id)} className={cx({unread})}>
    {unread && <div className='dot-badge'/>}
    <NonLinkAvatar person={follower}/>
    <span>
      <strong>{follower.name}</strong>&nbsp;
      {comment.user_id === currentUser.id ? 'You: ' : ''}
      {comment.text}
    </span>
  </A>
}
Thread.contextTypes = {dispatch: func, currentUser: object}
