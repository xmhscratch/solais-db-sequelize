const DbTable = require('./db-table')
const Member = require('./member')
const uuidv4 = require('uuid/v4')

class Group extends DbTable {

    constructor(groupName) {
        super(groupName)

        this.groupName = groupName
        return this
    }

    getDb() {
        const { groupName } = this

        return Db
            .connect(`${groupName}`)
            .load('./schema')
    }

    createMember() {
        const { groupName } = this
        const member = new Member(uuidv4(), groupName)

        return member.ensure()
    }
}

module.exports = Group
