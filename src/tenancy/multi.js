const Db = require('../db')
const Group = require('./multi/group')
const LRU = require('lru-cache')

class MultiTenancy {

    get tables() {
        return this._tables || {}
    }

    constructor(groupName) {
        this._initialized = false
        this.groupName = groupName
        this._members = LRU()

        return this
    }

    initialize() {
        return this
            .getGroup()
            .then((group) => {
                return group.getDb()
            })
            .then((group) => {
                this._tables = group.Tables
                this._initialized = true

                return this
            })
            .thenReturn(this)
    }

    getGroup() {
        if (this._group) {
            return this._group
        }

        this._group = new Group(this.groupName)
        return this._group
    }

    createMember() {
        if (!this._initialized) {
            throw new Error('Tenancy manager is not initialized!')
        }

        return this.getGroup()
            .then((group) => {
                return group.createMember()
            })
            .then((member) => {
                if (!member) return

                const tenantId = member.getId()
                this._members.set(tenantId, member)

                return member
            })
    }

    removeMember(tenantId) {
        if (!this._initialized) {
            throw new Error('Tenancy manager is not initialized!')
        }

        return this
            .getMember(tenantId)
            .then((member) => {
                if (!member) return

                this._members.del(tenantId)
                return member.drop()
            })
    }

    getMember(tenantId) {
        if (!this._initialized) {
            throw new Error('Tenancy manager is not initialized!')
        }

        if (this._members.has(tenantId)) {
            return Promise.resolve(
                this._members.get(tenantId)
            )
        }

        return this.getGroup()
            .then((group) => {
                return group.getMember(tenantId)
            })
            .then((member) => {
                if (!member) return

                this._members.set(tenantId, member)
                return member
            })
    }
}

module.exports = MultiTenancy
