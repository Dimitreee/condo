/**
 * Generated by `createschema resident.Resident 'user:Relationship:User:CASCADE; organization:Relationship:Organization:PROTECT; property:Relationship:Property:PROTECT; billingAccount?:Relationship:BillingAccount:SET_NULL; unitName:Text;'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */

const { generateGqlQueries } = require('@condo/domains/common/utils/codegeneration/generate.gql')
const { ADDRESS_META_SUBFIELDS_QUERY_LIST } = require('@condo/domains/property/schema/fields/AddressMetaField')

const gql = require('graphql-tag')

const COMMON_FIELDS = 'id dv sender { dv fingerprint } v deletedAt newId createdBy { id name } updatedBy { id name } createdAt updatedAt'

const RESIDENT_FIELDS = `{ user { id name } organization { id } residentOrganization { id name } property { id createdAt deletedAt } residentProperty { id name address } address addressMeta { ${ADDRESS_META_SUBFIELDS_QUERY_LIST} } unitName unitType ${COMMON_FIELDS} organizationFeatures { hasBillingData hasMeters } paymentCategories { id categoryName billingName acquiringName } }`
const Resident = generateGqlQueries('Resident', RESIDENT_FIELDS)

const REGISTER_RESIDENT_MUTATION = gql`
    mutation registerResident ($data: RegisterResidentInput!) {
        result: registerResident(data: $data) ${RESIDENT_FIELDS}
    }
`
const SERVICE_CONSUMER_FIELDS = `{ residentBillingAccount { id } residentAcquiringIntegrationContext { id integration { id hostUrl } } paymentCategory resident { id } billingAccount { id } accountNumber ${COMMON_FIELDS} organization { id name tin } }`
const ServiceConsumer = generateGqlQueries('ServiceConsumer', SERVICE_CONSUMER_FIELDS)

const REGISTER_SERVICE_CONSUMER_MUTATION = gql`
    mutation registerServiceConsumer ($data: RegisterServiceConsumerInput!) {
        obj: registerServiceConsumer(data: $data) ${SERVICE_CONSUMER_FIELDS}
    }
`

// TODO(codegen): write return type result!

const REGISTER_MULTIPLE_CONSUMERS_SERVICE_MUTATION = gql`
    mutation registerMultipleConsumersService ($data: RegisterMultipleConsumersServiceInput!) {
        result: registerMultipleConsumersService(data: $data) { id }
    }
`

/* AUTOGENERATE MARKER <CONST> */

module.exports = {
    Resident,
    REGISTER_RESIDENT_MUTATION,
    ServiceConsumer,
    REGISTER_SERVICE_CONSUMER_MUTATION,

    REGISTER_MULTIPLE_CONSUMERS_SERVICE_MUTATION,

/* AUTOGENERATE MARKER <EXPORTS> */
}
