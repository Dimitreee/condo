/**
 * Generated by `createschema resident.Resident 'user:Relationship:User:CASCADE; organization:Relationship:Organization:PROTECT; property:Relationship:Property:PROTECT; billingAccount?:Relationship:BillingAccount:SET_NULL; unitName:Text;'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */

const { generateGqlQueries } = require('@condo/domains/common/utils/codegeneration/generate.gql')

const gql = require('graphql-tag')

const COMMON_FIELDS = 'id dv sender v deletedAt newId createdBy { id name } updatedBy { id name } createdAt updatedAt'

const RESIDENT_FIELDS = `{ user { id name } organization { id } residentOrganization property { id } residentProperty billingAccount { id } address addressMeta unitName ${COMMON_FIELDS} }`
const Resident = generateGqlQueries('Resident', RESIDENT_FIELDS)

const REGISTER_RESIDENT_MUTATION = gql`
    mutation registerResident ($data: RegisterResidentInput!) {
        result: registerResident(data: $data) ${RESIDENT_FIELDS}
    }
`
/* AUTOGENERATE MARKER <CONST> */

module.exports = {
    Resident,
    REGISTER_RESIDENT_MUTATION,
/* AUTOGENERATE MARKER <EXPORTS> */
}
