class Db {

    static get Sequelize() {
        return require('sequelize')
    }

    static connect(dbname = 'tests', username = 'root', password = '', options = {}) {
        return {
            load: (dirPath, isRecursion) => {
                const db = new Db()

                return db
                    .createConnection(dbname, username, password, options)
                    .then((connection) => {
                        db._connection
                        console.log(connection)
                        return db.import(dirPath, isRecursion)
                    })
                    .thenReturn(db)
            }
        }
    }

    get tables() {
        return this._tables || {}
    }

    constructor() {
        this._tables = {}
        this._connection = null
        return this
    }

    createConnection(dbname = 'tests', username = 'root', password = '', options = {}) {
        if (this.isConnected()) {
            return Promise.resolve(this.getConnection())
        }

        const connection = new Db.Sequelize(
            _.isUndefined(dbname) ? config('database.name') : dbname,
            username || config('database.username', 'root'),
            password || config('database.password', ''),
            // sequelize options
            _.defaultsDeep(options, {
                dialect: config('database.dialect', 'mysql'),
                // dialectModulePath: 'mysql',
                host: config('database.host', '127.0.0.1'),
                port: config('database.port', 3306),
                pool: {
                    max: config('database.pool.max', 5),
                    min: config('database.pool.min', 0),
                    idle: config('database.pool.idle', 10000)
                },
                dialectOptions: {
                    charset: config('database.charset', 'utf8mb4')
                },
                define: {
                    charset: config('database.charset', 'utf8mb4'),
                    collate: config('database.collate', 'utf8mb4_unicode_ci')
                },
                logging: false
            })
        )

        return connection
            .authenticate()
            .then(() => {
                this._connection = connection
                config('dispatcher.onConnectionEstablish', _.noop)(connection)
            })
            .catch((error) => {
                config('dispatcher.onConnectionError', _.noop)(error, connection)
            })
            .thenReturn(connection)
    }

    import(dirPath, isRecursion = false) {
        const connection = this.getConnection()
// console.log(this)
        return Promise.promisify((dirPath, done) => async.map(
            fs(dirPath).getItems(
                false, !isRecursion ? { deep: 1 } : null
            ),
            (filePaths, callback) => {
                _.castArray(filePaths)
                    .filter((filePath) => {
                        return filePath.indexOf('.') !== 0
                    })
                    .forEach((filePath) => {
                        const model = connection.import(filePath)

                        this._tables[model.name] = model
                        return callback(null, model)
                    })
            }, (error, results) => {
                _.forEach(results, (model) => {
                    if (!model) return

                    if (this._tables[model.name].options.hasOwnProperty('associate')) {
                        this._tables[model.name].options.associate(results)
                    }
                }, this)

                return done()
            }
        ))(dirPath)
    }

    getConnection() {
        return this._connection
    }

    disconnect() {
        if (this.isConnected()) {
            return this.getConnection().close()
        }
        return false
    }

    isConnected() {
        return this.getConnection() ? true : false
    }

    addSchema(name, defineFunc) {
        const connection = this.getConnection()
        const model = connection.import(
            name, defineFunc
        )
        this._tables[model.name] = model
        return this
    }

    hasTable(tableName) {
        return this
            .createConnection(null)
            .then((connection) => {
                return connection.query(`SELECT IF("${tableName}" IN(SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA), true, false) AS isExist;`)
            })
            .then(rows => {
                return Boolean(
                    parseInt(_.get(rows, '0.0.isExist', 0))
                )
            })
    }
}

module.exports = Db