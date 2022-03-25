/**
 * Generated by `createschema billing.BillingIntegration name:Text;`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */

const { generateGqlQueries } = require('@condo/domains/common/utils/codegeneration/generate.gql')

const COMMON_FIELDS = 'id dv sender { dv fingerprint } v deletedAt newId createdBy { id name } updatedBy { id name } createdAt updatedAt'
const BILLING_INTEGRATION_DATA_FORMAT_FIELDS = '{ hasToPayDetails hasServices hasServicesDetails }'
const BILLING_INTEGRATION_OPTIONS_FIELDS = `{ title options { name displayName billingPageTitle descriptionDetails { urlText url } dataFormat ${BILLING_INTEGRATION_DATA_FORMAT_FIELDS} } }`
const BILLING_INTEGRATION_FIELDS = `{ name shortDescription logo { publicUrl } developer partnerUrl instruction appUrl detailsTitle detailsConfirmButtonText detailsInstructionButtonText detailsInstructionButtonLink contextDefaultStatus dataFormat ${BILLING_INTEGRATION_DATA_FORMAT_FIELDS} currencyCode billingPageTitle isHidden availableOptions ${BILLING_INTEGRATION_OPTIONS_FIELDS} ${COMMON_FIELDS} }`
const BillingIntegration = generateGqlQueries('BillingIntegration', BILLING_INTEGRATION_FIELDS)

const BILLING_INTEGRATION_ACCESS_RIGHT_FIELDS = `{ integration { id name } user { id name } ${COMMON_FIELDS} }`
const BillingIntegrationAccessRight = generateGqlQueries('BillingIntegrationAccessRight', BILLING_INTEGRATION_ACCESS_RIGHT_FIELDS)

const BILLING_INTEGRATION_ORGANIZATION_CONTEXT_FIELDS = `{ integration { id name billingPageTitle currencyCode dataFormat ${BILLING_INTEGRATION_DATA_FORMAT_FIELDS} availableOptions { options { name displayName billingPageTitle dataFormat ${BILLING_INTEGRATION_DATA_FORMAT_FIELDS} } } } organization { id name } settings state status lastReport integrationOption ${COMMON_FIELDS} }`
const BillingIntegrationOrganizationContext = generateGqlQueries('BillingIntegrationOrganizationContext', BILLING_INTEGRATION_ORGANIZATION_CONTEXT_FIELDS)

const BILLING_INTEGRATION_LOG_FIELDS = `{ context ${BILLING_INTEGRATION_ORGANIZATION_CONTEXT_FIELDS} type message meta ${COMMON_FIELDS} }`
const BillingIntegrationLog = generateGqlQueries('BillingIntegrationLog', BILLING_INTEGRATION_LOG_FIELDS)

const BILLING_PROPERTY_FIELDS = `{ context ${BILLING_INTEGRATION_ORGANIZATION_CONTEXT_FIELDS} importId address raw meta ${COMMON_FIELDS} }`
const BillingProperty = generateGqlQueries('BillingProperty', BILLING_PROPERTY_FIELDS)

const BILLING_ACCOUNT_FIELDS = `{ context ${BILLING_INTEGRATION_ORGANIZATION_CONTEXT_FIELDS} importId property { id } number unitName unitType raw meta ${COMMON_FIELDS} }`
const BillingAccount = generateGqlQueries('BillingAccount', BILLING_ACCOUNT_FIELDS)

const BILLING_METER_RESOURCE_FIELDS = `{ name ${COMMON_FIELDS} }`
const BillingMeterResource = generateGqlQueries('BillingMeterResource', BILLING_METER_RESOURCE_FIELDS)

const BILLING_ACCOUNT_METER_FIELDS = `{ context ${BILLING_INTEGRATION_ORGANIZATION_CONTEXT_FIELDS} importId property { id } account { id } resource { id } raw meta ${COMMON_FIELDS} }`
const BillingAccountMeter = generateGqlQueries('BillingAccountMeter', BILLING_ACCOUNT_METER_FIELDS)

const BILLING_ACCOUNT_METER_READING_FIELDS = `{ context ${BILLING_INTEGRATION_ORGANIZATION_CONTEXT_FIELDS} importId property { id } account { id } meter { id number } period value1 value2 value3 value4 date raw ${COMMON_FIELDS} }`
const BillingAccountMeterReading = generateGqlQueries('BillingAccountMeterReading', BILLING_ACCOUNT_METER_READING_FIELDS)

const BILLING_RECEIPT_TO_PAY_DETAILS_FIELDS = 'toPayDetails { charge formula balance recalculation privilege penalty }'
const BILLING_RECEIPT_SERVICE_TO_PAY_DETAILS_FIELDS = BILLING_RECEIPT_TO_PAY_DETAILS_FIELDS.replace('}', 'volume tariff measure }')
const BILLING_RECEIPT_SERVICE_FIELDS = `services { id name toPay ${BILLING_RECEIPT_SERVICE_TO_PAY_DETAILS_FIELDS} }`
const BILLING_RECEIPT_RECIPIENT_FIELDS = 'recipient { tin iec bic bankAccount }'
const BILLING_RECEIPT_FIELDS = `{ context ${BILLING_INTEGRATION_ORGANIZATION_CONTEXT_FIELDS} importId property { id, address } account { id, number, unitName } period raw toPay printableNumber ${BILLING_RECEIPT_TO_PAY_DETAILS_FIELDS} ${BILLING_RECEIPT_SERVICE_FIELDS} receiver { id tin iec bic bankAccount } ${BILLING_RECEIPT_RECIPIENT_FIELDS} ${COMMON_FIELDS} }`
const BillingReceipt = generateGqlQueries('BillingReceipt', BILLING_RECEIPT_FIELDS)

const RESIDENT_BILLING_RECEIPTS_FIELDS =  `{ id ${BILLING_RECEIPT_RECIPIENT_FIELDS} period toPay paid ${BILLING_RECEIPT_TO_PAY_DETAILS_FIELDS} ${BILLING_RECEIPT_SERVICE_FIELDS} printableNumber serviceConsumer { id paymentCategory } currencyCode }`
const ResidentBillingReceipt = generateGqlQueries('ResidentBillingReceipt', RESIDENT_BILLING_RECEIPTS_FIELDS)

const BILLING_RECIPIENT_FIELDS = `{ context { id } importId tin iec bic bankAccount purpose isApproved meta name ${COMMON_FIELDS} }`
const BillingRecipient = generateGqlQueries('BillingRecipient', BILLING_RECIPIENT_FIELDS)

/* AUTOGENERATE MARKER <CONST> */

module.exports = {
    BillingIntegration,
    BillingIntegrationAccessRight,
    BillingIntegrationOrganizationContext,
    BillingIntegrationLog,
    BillingProperty,
    BillingAccount,
    BillingMeterResource,
    BillingAccountMeter,
    BillingAccountMeterReading,
    BillingReceipt,
    ResidentBillingReceipt,
    RESIDENT_BILLING_RECEIPTS_FIELDS,
    BillingRecipient,
/* AUTOGENERATE MARKER <EXPORTS> */
}
