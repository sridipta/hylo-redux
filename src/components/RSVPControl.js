import React from 'react'
import { Link } from 'react-router'
import cx from 'classnames'
const { object, func, array, string } = React.PropTypes
import { filter } from 'lodash'
import Avatar from './Avatar'
import Dropdown from './Dropdown'

const RSVPButton = props => {
  let { eventResponse, responderList, onPickResponse } = props
  let { response, title, responders } = responderList
  return <button type='button' onClick={() => onPickResponse(response)}
    className={cx(`rsvp-#{response} btn btn-default`, {'active': eventResponse === response})}>
    {title}
    {responders.length > 0 && ` (${responders.length})`}
  </button>
}

const Responder = props => {
  let { responder } = props
  return <li key={responder.id}>
      <span className='person'>
        <Avatar person={responder}/>
        <Link className='person' to={`/u/${responder.id}`}>
          <span>{responder.name}</span>
        </Link>
      </span>
    </li>
}

const ResponderList = props => {
  let {responderList} = props
  if (responderList.responders.length === 0) return <span />
  return <span>
    <li className='header'>
      <span className='header'>{responderList.title}</span>
    </li>
    {responderList.responders.map(r => <Responder responder={r} key={r.id} />)}
  </span>
}

const RSVPControl = props => {
  let { responders, onPickResponse, currentResponse } = props

  var respondersByType = [
    {title: 'Going', response: 'yes', responders: filter(responders, er => er.response === 'yes')},
    {title: 'Maybe', response: 'maybe', responders: filter(responders, er => er.response === 'maybe')},
    {title: 'Can\'t Go', response: 'no', responders: filter(responders, er => er.response === 'no')}
  ]

  return (
    <div className='rsvp-controls post-section'>
      {onPickResponse && <div className='btn-group buttons'>
        {respondersByType.map(rl =>
          <RSVPButton currentResponse={currentResponse}
            responderList={rl}
            onPickResponse={onPickResponse}
            key={rl.response}/>)}
      </div>}

      {responders.length > 0 && <div className='responses'>
        <Dropdown className='responses-dropdown'
          toggleChildren={<span>See Responses</span>}>
          {respondersByType.map(rl =>
            <ResponderList responderList={rl} key={rl.response}/>)}
        </Dropdown>
      </div>}
    </div>
  )
}

RSVPControl.propTypes = {
  responders: array,
  currentUser: object,
  post: object,
  onPickResponse: func,
  currentResponse: string
}

export default RSVPControl
