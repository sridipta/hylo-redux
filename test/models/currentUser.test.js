import {
  canComment, canModerate, isMember, isTester, canInvite
} from '../../src/models/currentUser'
import { MemberRole } from '../../src/models/community'

describe('currentUser', () => {
  describe('.isMember', () => {
    it('returns true if the user has a membership', () => {
      let community = {id: 'bar'}

      let user = {
        memberships: [
          {community_id: 'foo'},
          {community_id: 'bar'}
        ]
      }

      expect(isMember(user, community)).to.be.true
    })
  })

  describe('.canInvite', () => {
    it('is true if the user is a moderator', () => {
      let community = {id: 'bar'}

      let user = {
        memberships: [
          {community_id: 'foo'},
          {community_id: 'bar', role: MemberRole.MODERATOR}
        ]
      }

      expect(canInvite(user, community)).to.be.true
    })

    it('is true if the user is a member and the community has "all_can_invite" enabled', () => {
      let community = {id: 'bar', settings: {all_can_invite: true}}
      let user = {
        memberships: [
          {community_id: 'bar'}
        ]
      }

      expect(canInvite(user, community)).to.be.true
    })

    it('is false if there is no community', () => {
      const user = {memberships: [{community_id: 'bar'}], is_admin: true}
      expect(canInvite(user, null)).to.be.false
    })
  })

  describe('.canModerate', () => {
    it('is true if the user is a moderator', () => {
      const user = {memberships: [{community_id: 'bar', role: MemberRole.MODERATOR}]}
      expect(canModerate(user, {id: 'bar'})).to.be.true
    })

    it('is false if the user is not a moderator', () => {
      const user = {memberships: [{community_id: 'bar', role: MemberRole.DEFAULT}]}
      expect(canModerate(user, {id: 'bar'})).to.be.false
    })

    it('is false if the user is not a member', () => {
      const user = {memberships: [{community_id: 'foo', role: MemberRole.MODERATOR}]}
      expect(canModerate(user, {id: 'bar'})).to.be.false
    })

    it('is false if there is no community', () => {
      const user = {memberships: [{community_id: 'bar'}], is_admin: true}
      expect(canModerate(user, null)).to.be.false
    })
  })

  describe('.isTester', () => {
    it('returns true if the user is in a community with test feature access', () => {
      const u1 = {
        memberships: [{community_id: '1'}, {community_id: '29'}]
      }
      const u2 = {
        memberships: [{community_id: '1'}, {community_id: '1972'}]
      }

      expect(isTester(u1)).to.be.true
      expect(isTester(u2)).to.be.true
    })
  })

  describe('.canComment', () => {
    it('is true if the user is a follower', () => {
      expect(canComment({id: 1}, {follower_ids: [1, 8]})).to.be.true
    })

    it("is true if the user is in one of the post's communities", () => {
      const user = {id: 1, memberships: [{community_id: 2}]}
      expect(canComment(user, {community_ids: [5, 2]})).to.be.true
    })

    it('is false if there is no user', () => {
      expect(canComment(null, {follower_ids: [4]})).to.be.false
    })

    it('is false otherwise', () => {
      const user = {id: 1, memberships: [{community_id: 2}]}
      const post = {community_ids: [5, 3], follower_ids: [3, 7]}
      expect(canComment(user, post)).to.be.false
    })
  })
})
