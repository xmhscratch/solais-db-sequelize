class DbTable {

	constructor(tableName) {
		this._db = new Db()
		this.tableName = tableName

		return this
	}

    ensure() {
        return this._db
            .createConnection(null)
            .then(() => {
                const connection = db.getConnection()
                connection.query(``)
            })
    }

    drop() {
        return this._db
            .createConnection(null)
            .then(() => {
                const connection = db.getConnection()
                connection.query(``)
            })
    }
}
