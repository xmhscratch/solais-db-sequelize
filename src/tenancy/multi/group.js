const Db = require('../../db')
const DbTable = require('./db-table')
const Member = require('./member')
const uuidv4 = require('uuid/v4')

class Group extends DbTable {

    constructor(groupName) {
        super(groupName)
        this.groupName = groupName

        return this
            .ensure()
            .thenReturn(this)
    }

    ensure() {
        const { tableName } = this

        return Promise.using(
            this.getDb(),
            super.ensure(),
            (db) => {
                const connection = db.getConnection()
                this.getMemberSchema(connection).sync()
                return
            }
        )
    }

    getDb() {
        const { groupName } = this

        return Db
            .connect(`${groupName}`)
            .load('./schema')
    }

    getMemberSchema(connection) {
        const SchemaModel = connection.define('_members', {
            title: Db.Sequelize.STRING,
            description: Db.Sequelize.TEXT,
            deadline: Db.Sequelize.DATE
        }, {
            timestamps: true,
            paranoid: true,
            underscored: true,
            freezeTableName: true,
            tableName: '_members'
        })

        return SchemaModel
    }

    getTables() {
        
    }

    createMember() {
        const { groupName } = this
        return new Member(uuidv4(), groupName)
    }

    removeMember(tenantId) {
        const { groupName } = this
        
        return this.getMember()
            .then((member) => {
                if (!member) return
                return member.drop()
            })
    }

    getMember(tenantId) {
        const { groupName } = this
        const tableName = Member.getTableName(tenantId, groupName)

        return this
            .getDb()
            .then((db) => {
                return db.hasTable(tableName)
            })
            .then((isExist) => {
                if (!isExist) {
                    return
                }
                return new Member(tenantId, groupName)
            })
    }
}

module.exports = Group
