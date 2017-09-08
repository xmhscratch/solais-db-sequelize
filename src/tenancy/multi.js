const Db = require('../db')
const Group = require('./multi/group')

class MultiTenancy {

    get tables() {
        return this.getGroup().getDb()
    }

    constructor(groupName) {
        this.groupName = groupName
        return this
    }

    getGroup() {
        if (this._group) {
            return this._group
        }

        const { groupName } = this
        this._group = new Group(groupName)

        this._group
            .ensure()
            .then(() => {
                this._members = LRU()
            })

        return this._group
    }

    addMember() {
        return this
            .getGroup()
            .createMember()
            .then(() => {
                this._members.set(tenantId, member)
            })
    }

    getMember(tenantId) {
        return this._members.get(tenantId)
    }

    removeMember(tenantId) {
        return this
            .getMember(tenantId)
            .drop()
            .then(() => {
                this._members.del()
            })
    }
}

module.exports = MultiTenancy
