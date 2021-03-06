import React from 'react'
import { indexOf, isEmpty, omit } from 'lodash/fp'
import { getKeyCode, keyMap } from '../util/textInput'
var { array, func, object, bool, number } = React.PropTypes

export class KeyControlledList extends React.Component {

  static propTypes = {
    onChange: func,
    children: array,
    selectedIndex: number,
    tabChooses: bool,
    spaceChooses: bool
  }

  static defaultProps = {
    selectedIndex: 0,
    tabChooses: false
  }

  constructor (props) {
    super(props)
    let { selectedIndex } = props
    this.state = {selectedIndex}
  }

  componentWillReceiveProps (nextProps) {
    var max = nextProps.children.length - 1
    if (this.state.selectedIndex > max) {
      this.setState({selectedIndex: max})
    }
  }

  changeSelection = delta => {
    if (isEmpty(this.props.children)) return

    var i = this.state.selectedIndex
    var length = React.Children.count(this.props.children)

    i += delta
    if (i < 0) i += length
    i = i % length

    this.setState({selectedIndex: i})
  }

  // this method is called from other components
  // returning true indicates that the event has been handled
  handleKeys = event => {
    const chooseCurrentItem = () => {
      if (isEmpty(this.props.children)) return false

      const elementChoice = this.childrenWithRefs[this.state.selectedIndex]
      if (elementChoice) {
        const nodeChoice = this.refs[elementChoice.ref]
        this.change(elementChoice, nodeChoice, event)
        return true
      }

      event.preventDefault()
      return false
    }

    switch (getKeyCode(event)) {
      case keyMap.UP:
        event.preventDefault()
        this.changeSelection(-1)
        return true
      case keyMap.DOWN:
        event.preventDefault()
        this.changeSelection(1)
        return true
      case keyMap.TAB:
        if (this.props.tabChooses) return chooseCurrentItem()
        break
      case keyMap.SPACE:
        // FIXME we should be consistent with defaults, so either change this or
        // tabChooses above
        if (this.props.spaceChooses !== false) return chooseCurrentItem()
        break
      case keyMap.ENTER:
        return chooseCurrentItem()
    }

    return false
  }

  change = (element, node, event) => {
    event.preventDefault()
    this.props.onChange(element, node, event)
  }

  // FIXME use more standard props e.g. {label, value} instead of {id, name}, or
  // provide an API for configuring them
  render () {
    const { selectedIndex } = this.state
    const { children, ...props } = this.props

    this.childrenWithRefs = React.Children.map(children,
      (element, i) => {
        const className = selectedIndex === i
          ? element.props.className + ' active'
          : element.props.className
        return element && element.props
          ? React.cloneElement(element, {ref: i, className})
          : element
      })

    return <ul {...omit(['onChange', 'tabChooses', 'selectedIndex'], props)}>
      {this.childrenWithRefs}
    </ul>
  }
}

export class KeyControlledItemList extends React.Component {

  static propTypes = {
    onChange: func.isRequired,
    items: array,
    selected: object,
    tabChooses: bool
  }

  // this method is called from other components
  handleKeys = event => {
    return this.refs.kcl.handleKeys(event)
  }

  change = (choice, event) => {
    event.preventDefault()
    this.props.onChange(choice, event)
  }

  onChangeExtractingItem = (element, node, event) => {
    const item = this.props.items[element.ref]
    this.change(item, event)
  }

  // FIXME use more standard props e.g. {label, value} instead of {id, name}, or
  // provide an API for configuring them
  render () {
    const { items, selected, ...props } = this.props
    const selectedIndex = indexOf(selected, items)
    return <KeyControlledList ref='kcl' tabChooses selectedIndex={selectedIndex}
      onChange={this.onChangeExtractingItem} {...omit('onChange', props)}>
      {items.map((c, i) =>
        <li key={c.id || 'blank'}>
          <a onClick={event => this.change(c, event)}>{c.name}</a>
        </li>)}
    </KeyControlledList>
  }
}
