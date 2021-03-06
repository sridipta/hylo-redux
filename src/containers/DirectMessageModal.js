import React from 'react'
import { connect } from 'react-redux'
import { get } from 'lodash'
import { closeModal, navigate, showDirectMessage } from '../actions'
import { findOrCreateThread } from '../actions/threads'
import { threadUrl } from '../routes'
import { Modal } from '../components/Modal'
import MessageToUserForm from '../components/MessageToUserForm'
import PersonChooser from '../components/PersonChooser'
const { func, object, string } = React.PropTypes

const PersonPicker = (props) => {
  const { onSelect, exclude } = props
  const select = (person) => {
    onSelect(person.id, person.name)
  }
  return <PersonChooser placeholder='Start typing a name...' onSelect={select}
    typeaheadId='messageTo' exclude={exclude}/>
}
PersonPicker.propTypes = {onSelect: func, exclude: object}

@connect((state, { userId }) => {
  return ({
    currentUser: get(state, 'people.current'),
    postId: state.threadsByUser[userId]
  })
})
export default class DirectMessageModal extends React.Component {
  static propTypes = {
    postId: string,
    userId: string,
    userName: string,
    onCancel: func
  }

  static contextTypes = {dispatch: func, currentUser: object}

  componentDidMount () {
    const { dispatch } = this.context
    const { postId, userId } = this.props
    if (userId && !postId) dispatch(findOrCreateThread(userId))
  }

  onSelect (userId, userName) {
    const { dispatch } = this.context
    dispatch(showDirectMessage(userId, userName))
  }

  render () {
    const { onCancel, postId, userId, userName } = this.props
    const { dispatch, currentUser } = this.context
    const title = userId ? `You and ${userName}`
      : <PersonPicker onSelect={this.onSelect.bind(this)} exclude={currentUser}/>

    const onComplete = () => {
      dispatch(navigate(threadUrl(postId)))
      dispatch(closeModal())
      onCancel()
    }

    return <Modal {...{title}} id='direct-message' onCancel={onCancel}>
      <MessageToUserForm {...{userId, onComplete, postId}}/>
    </Modal>
  }
}
