import React from 'react'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
import cx from 'classnames'
const { func, object } = React.PropTypes
import { fetchCurrentUser, updateUserSettings, updateUserSettingsEditor } from '../../actions'

@prefetch(({ dispatch, params: {id} }) => dispatch(fetchCurrentUser()))
@connect(({ people }, props) => ({currentUser: people.current}))
export default class UserSettings extends React.Component {
  constructor (props) {
    super(props)
    this.state = {editing: {}, edited: {}}
  }

  static propTypes = {
    currentUser: object,
    dispatch: func
  }

  updateStore (data) {
    let { dispatch } = this.props
    dispatch(updateUserSettingsEditor(data))
  }

  setEmail = event =>
    this.setState({edited: {...this.state.edited, email: event.target.value}})

  save = (field) => {
    let { dispatch, currentUser } = this.props
    let { editing, edited } = this.state
    this.setState({editing: {...editing, [field]: false}})
    dispatch(updateUserSettingsEditor({...currentUser, ... edited}))
    dispatch(updateUserSettings({...currentUser, ... edited}, {[field]: currentUser[field]}))
  }

  edit (field) {
    let { currentUser } = this.props
    let { editing, edited } = this.state
    edited[field] = currentUser[field]
    this.setState({editing: {...editing, [field]: true}})
  }

  cancelEdit (field) {
    let { editing } = this.state
    this.setState({editing: {...editing, [field]: false}})
  }

  render () {
    let { currentUser } = this.props
    let { editing, edited, expand1 } = this.state

    return <div id='user'>
      <div className='settings'>
        <div className='section-label' onClick={() => this.setState({expand1: !expand1})}>
          Account
          <i className={cx({'icon-down': expand1, 'icon-right': !expand1})}></i>
        </div>
        {expand1 && <div className='section email'>
          <div className='setting-item'>
            <div className='half-column'>
              <label>Your Email</label>
              <p>{currentUser.email}</p>
            </div>
            {!editing.email && <div className='half-column value'>
              <button type='button' onClick={() => this.edit('email')}>Change</button>
            </div>}
            {editing.email && <div className='half-column value'>
              <form name='emailForm'>
                <div className={cx('form-group', {'has-error': false})}>
                  <input type='text' ref='email' className='email form-control'
                    value={edited.email}
                    onChange={this.setEmail}/>
                  </div>
              </form>
              <div className='buttons'>
                <button type='button' onClick={() => this.cancelEdit('email')}>Cancel</button>
                <button type='button' className='btn-primary' onClick={() => this.save('email')}>Save</button>
              </div>
            </div>}
          </div>
        </div>}
      </div>
    </div>
  }

}
