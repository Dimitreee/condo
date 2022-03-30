/**
 * Generated by `createschema condo.User 'name:Text;isAdmin:Checkbox;isSupport:Checkbox;type:Text' --force`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */

const { generateGqlQueries } = require('@miniapp/domains/common/utils/codegeneration/generate.gql')

const gql = require('graphql-tag')

const COMMON_FIELDS = 'id v deletedAt newId createdBy { id name } updatedBy { id name } createdAt updatedAt'

const USER_FIELDS = `{ name isAdmin isSupport type ${COMMON_FIELDS} }`
const User = generateGqlQueries('User', USER_FIELDS)

/* AUTOGENERATE MARKER <CONST> */

module.exports = {
    User,
/* AUTOGENERATE MARKER <EXPORTS> */
}
