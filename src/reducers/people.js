import { composeReducers } from './util'
import { get } from 'lodash'
import { isNull, isUndefined, omitBy } from 'lodash/fp'
import { debug } from '../util/logging'
import {
  ADD_DATA_TO_STORE,
  FETCH_CURRENT_USER,
  FETCH_PEOPLE,
  FETCH_PERSON,
  LOGIN,
  SIGNUP
} from '../actions'
import { mergeList } from './util'
import currentUserReducer from './currentUser'

export const normalize = person => {
  return omitBy(x => isNull(x) || isUndefined(x), {
    ...person,
    recent_request: null,
    recent_offer: null,
    recent_request_id: get(person.recent_request, 'id'),
    recent_offer_id: get(person.recent_offer, 'id'),
    left_nav_tags: null,
    people: null,
    communities: null
  })
}

const peopleReducer = (state = {}, action) => {
  const { type, error, payload, meta } = action
  if (error) return state

  switch (type) {
    case ADD_DATA_TO_STORE:
      if (meta.bucket === 'people') {
        return mergeList(state, payload.map(normalize), 'id')
      }
      break
    case FETCH_PERSON:
      debug('caching person:', payload.id)
      return {
        ...state,
        [payload.id]: {...state[payload.id], ...normalize(payload)}
      }
    case LOGIN:
    case SIGNUP:
    case FETCH_CURRENT_USER:
      if (payload) return {...state, [payload.id]: normalize(payload)}
      break
    case FETCH_PEOPLE:
      return mergeList(state, payload.items.map(normalize), 'id')
  }

  return state
}

export default composeReducers(
  peopleReducer,
  (state = {}, action) => {
    const newState = currentUserReducer(state.current, action)
    if (newState !== state.current) {
      return {...state, current: newState}
    }
    return state
  }
)
