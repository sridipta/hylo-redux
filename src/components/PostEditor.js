import React from 'react'
import { contains, curry, filter, startsWith } from 'lodash'
import cx from 'classnames'
import TagInput from './TagInput'
import RichTextEditor from './RichTextEditor'
import { connect } from 'react-redux'
import { typeahead, updatePostEditor, createPost } from '../actions'

const { array, bool, func, object, string } = React.PropTypes

const postTypes = ['chat', 'request', 'offer', 'intention', 'event']

const postTypeData = {
  intention: {
    placeholder: 'What would you like to create?'
  },
  offer: {
    placeholder: 'What would you like to share?'
  },
  request: {
    placeholder: 'What are you looking for?'
  },
  chat: {
    placeholder: 'What do you want to say?'
  },
  event: {
    placeholder: "What is your event's name?"
  }
}

@connect((state, props) => ({
  communities: props.community ? [props.community] : [],
  mentionChoices: state.typeaheadMatches.post,
  currentUser: state.people.current,
  ...state.postEditor
}))
export default class PostEditor extends React.Component {
  static propTypes = {
    title: string,
    type: string,
    details: string,
    community: object,
    communities: array,
    expanded: bool,
    dispatch: func,
    mentionChoices: array,
    currentUser: object,
    public: bool
  }

  updateStore (data) {
    this.props.dispatch(updatePostEditor(data))
  }

  selectType = (type, event) =>
    this.updateStore({type: type})

  expand = () =>
    this.props.expanded || this.updateStore({expanded: true})

  cancel = () =>
    this.updateStore({expanded: false})

  setTitle = event =>
    this.updateStore({title: event.target.value})

  setDetails = event => this.updateStore({details: event.target.value})

  addCommunity = community =>
    this.updateStore({communities: this.props.communities.concat(community)})

  removeCommunity = community =>
    this.updateStore({communities: filter(this.props.communities, c => c.id !== community.id)})

  togglePublic = () =>
    this.updateStore({public: !this.props.public})

  validate () {
    if (!this.props.title) {
      window.alert('The title of a post cannot be blank.')
      this.refs.title.focus()
      return
    }

    return true
  }

  save = () => {
    if (!this.validate()) return

    // we use setTimeout here to avoid a race condition. the details field (tinymce)
    // may not fire its change event until it loses focus, so if we click Post
    // immediately after typing in the details field, we have to wait for props
    // to update from the store
    setTimeout(() => {
      let { dispatch, title, details, type, communities } = this.props
      dispatch(createPost({
        type: type || 'chat',
        name: title,
        description: details,
        communities: communities.map(c => c.id),
        public: this.props.public
      }))
    })
  }

  findCommunities = term => {
    if (!term) return

    let { currentUser } = this.props
    var match = c =>
      startsWith(c.name.toLowerCase(), term.toLowerCase()) &&
      !contains((this.props.communities || []).map(x => x.id), c.id)

    return filter(currentUser.memberships.map(m => m.community), match)
  }

  mentionTemplate = person => {
    return <a data-user-id={person.id} href={'/u/' + person.id}>{person.name}</a>
  }

  mentionTypeahead = text => {
    if (text) {
      this.props.dispatch(typeahead({text: text, context: 'post'}))
    } else {
      this.props.dispatch(typeahead({cancel: true, context: 'post'}))
    }
  }

  render () {
    var { title, details, expanded, communities } = this.props
    var selectedType = this.props.type || 'chat'
    var placeholder = postTypeData[selectedType].placeholder

    return <div className={cx('post-editor', 'clearfix', {expanded: expanded})}>
      <ul className='left post-types'>
        {postTypes.map(type => <li key={type}
          className={cx('post-type', type, {selected: type === selectedType})}
          onClick={curry(this.selectType)(type)}>
          {type}
        </li>)}
      </ul>

      <input type='text' ref='title' className='title form-control'
        placeholder={placeholder}
        onFocus={this.expand} value={title} onChange={this.setTitle}/>

      {expanded && <div>
        <h3>Details</h3>
        <RichTextEditor className='details'
          content={details}
          onChange={this.setDetails}
          mentionTemplate={this.mentionTemplate}
          mentionTypeahead={this.mentionTypeahead}
          mentionChoices={this.props.mentionChoices}
          mentionSelector='[data-user-id]'/>

        <h3>Communities</h3>
        <TagInput tags={communities}
          getChoices={this.findCommunities}
          onSelect={this.addCommunity}
          onRemove={this.removeCommunity}/>

        <label>
          <input type='checkbox' value={this.props.public} onChange={this.togglePublic}/>
          &nbsp;
          Make this post publicly visible
        </label>

        <div className='right buttons'>
          <button onClick={this.cancel}>Cancel</button>
          <button className='btn-primary' onClick={this.save}>Post</button>
        </div>
      </div>}
    </div>
  }
}
