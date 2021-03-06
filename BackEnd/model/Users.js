const bcrypt = require('bcryptjs')
const db = require('../database/models')
const { OTJSNotFoundException } = require('../Exceptions/OTJSErrors')
const AdClient = require('./ldap/adClient')

class Users {

  constructor(username) {
    this.username = username
  }

  _getUserEntity() {
    return db.User.findOne({ where: { username: this.username } }).then(entity => {
      if (!entity) {
        throw new OTJSNotFoundException('Not Found')
      } else {
        return entity
      }
    }).catch(error => { throw error })
  }

  isAdmin() {
    return this._getUserEntity().then(user => user.super_admin).catch((error) => { throw error })
  }

  async checkLDAPPassword(plainPassword) {
    let username = this.username;
    if (this.username.indexOf('@') === 0) {
      username = username.substr(1)
    }

    const option = await db.LdapOptions.findOne(({
      where: { id: 1 }, attributes: ['TypeGroupe',
        'protocole',
        'adresse',
        'port',
        'DN',
        'mdp', 'user', 'groupe', 'base']
    }))

    let client;
    if (option.TypeGroupe === 'ad') {
      client = new AdClient(option.TypeGroupe, option.protocole, option.adresse, option.port, option.DN, option.mdp, option.base, option.user, option.groupe)
    } else if (option.TypeGroupe === 'ldap') {
      //ToDo
      throw 'ToDo'
    } else {
      throw 'inccorect TypeGroupe'
    }

    return client.autentification(username, plainPassword)

  }

  checkLocalPassword(plainPassword) {
    return this._getUserEntity().then(async user => {
      return await bcrypt.compare(plainPassword, user.password)
    }).catch((error) => { throw error })
  }

  getAuthenticationMode() {
    return db.Option.findOne({
      attributes: ['ldap'],
      where: { id: '1' }
    })
  }

  async checkPassword(plainPassword) {

    let option = await this.getAuthenticationMode()
    if (option.ldap && this.username.indexOf('@') !== -1) {
      //LDAP user
      return await this.checkLDAPPassword(plainPassword).catch((error) => { throw error })
    } else {
      //Local user
      return await this.checkLocalPassword(plainPassword).catch((error) => { throw error })
    }


  }

  static async createUser(username, firstname, lastname, email, password, role, super_admin) {

    if (username.indexOf('@') !== -1) throw new Error('@ is forbiden')

    const saltRounds = 10
    return bcrypt.hash(password, saltRounds).then(function (hash) {
      db.User.create({
        username: username,
        firstname: firstname,
        lastname: lastname,
        email: email,
        password: hash,
        role: role,
        super_admin: super_admin
      }
      ).catch(e => { throw e })

    })
  }

  static async deleteUser(username) {
    let user = new Users(username)

    if (await user.isAdmin()) {
      let superUserCount = await db.User.findAndCountAll({ where: { super_admin: true } })
      if (superUserCount <= 1) throw 'Can\'t delete last super user'
    }

    await db.User.destroy({
      where: {
        username: username
      }
    })

  }

  static async modifyUser(username, firstname, lastname, password, email, role, isSuperAdmin) {

    if (username.indexOf('@') !== -1) throw '@ is forbiden'

    let user = new Users(username)

    if (await user.isAdmin() && role !== 'admin') throw 'Can\'t modify superAdmin\'s role'

    const mod = await user._getUserEntity()
    mod.username = username
    mod.firstname = firstname
    mod.lastname = lastname
    mod.super_admin = isSuperAdmin
    mod.email = email

    if (password !== null) {
      mod.password = await bcrypt.hash(password, 10).catch((error) => {
        throw error
      })
    }

    mod.role = role
    await mod.save()

  }

  static async getUsers() {
    let userEntities = await db.User.findAll()
    let usersAnswer = []
    userEntities.forEach( (user) => {
      usersAnswer.push({
        id : user.id,
        username : user.username,
        email : user.email,
        firstname : user.firstname,
        lastname : user.lastname,
        role : user.role,
        superAdmin : user.super_admin
      })
    })
    return usersAnswer
  }

  getLocalUserRight() {
    return this._getUserEntity().then(user => {
      return db.Role.findOne({
        where: { name: user.role }
      })
    })
  }

  async getLDAPUserRight() {
    let username = this.username;
    if (this.username.indexOf('@') === 0) {
      username = username.substr(1)
    }

    const option = await db.LdapOptions.findOne(
      ({
        where: { id: 1 }
      })
    )

    let client;
    if (option.TypeGroupe === 'ad') {
      client = new AdClient(option.TypeGroupe, option.protocole, option.adresse, option.port, option.DN, option.mdp, option.base, option.user, option.groupe)
    } else if (option.TypeGroupe === 'ldap') {
      //ToDo
      throw 'ToDo'
    } else {
      throw 'inccorect TypeGroupe'
    }

    const opt = await db.DistantUser.findAll(({ attributes: ['groupName'] }))
    const roles = [];
    for (let u = 0; u < opt.length; u++) { roles.push(opt[u].dataValues.groupName) }

    let response = await client.getPermission(username, roles)

    for (let i = 0; i < response.length; i++) {

      let resp = await db.DistantUser.findOne(({ where: { groupName: response[i] }, attributes: ['roleDistant'] }))
      let role = await resp.dataValues.roleDistant;

      let option = await db.Role.findOne((
        {
          where: { name: role }
        }
      ))

      return {
        import: option.dataValues.import,
        content: option.dataValues.content,
        anon: option.dataValues.anon,
        export_local: option.dataValues.export_local,
        export_extern: option.dataValues.export_extern,
        query: option.dataValues.query,
        auto_query: option.dataValues.auto_query,
        delete: option.dataValues.delete,
        admin: option.dataValues.admin,
        modify: option.dataValues.modify
      }

    }

  }

  getUserRight() {

    return this.getAuthenticationMode().then(async option => {
      if (option.ldap && this.username.indexOf('@') !== -1) {
        //LDAP user
        let LDAPasnwer = await this.getLDAPUserRight()
        return LDAPasnwer
      } else {
        //Local user
        let localAnswer = await this.getLocalUserRight()
        return localAnswer
      }

    }).catch(error => { throw error })

  }

}

module.exports = Users
