const Ldap = require('../model/Ldap')

var getLdapSettings = async function (req, res) {
  const options = await Ldap.getLdapSettings()
  res.json(options)
}

var setLdapSettings = async function (req, res) {
  const options = req.body

  await Ldap.setLdapSettings(
    options.TypeGroupe,
    options.adresse,
    options.port,
    options.DN,
    options.mdp,
    options.protocole,
    options.groupe,
    options.user,
    options.base
  )

  res.json(true)

}

var testLdapSettings = async function (req, res) {
  let answer = await Ldap.testLdapSettings()
  res.json(answer)

}

var getLdapCorrespodences = async function (req, res) {
  const matches = await Ldap.getAllCorrespodences()
  res.json(matches)
}

var setLdapCorrespodence = async function (req, res) {
  const matches = req.body
  await Ldap.setCorrespodence(matches[0].groupName, matches[0].associedRole)
  res.sendStatus(200)
}

var deleteCorrespodence = async function (req, res) {
  const match = req.body
  await Ldap.deleteCorrespodence(match.correspodence)
  res.sendStatus(200)
}

var getLdapGroupeNames = async function (req, res) {
  let matches = await Ldap.getAllGroupeNames()
  res.json(matches)
}

module.exports = { getLdapSettings, setLdapSettings, testLdapSettings, getLdapCorrespodences, setLdapCorrespodence, deleteCorrespodence, getLdapGroupeNames }