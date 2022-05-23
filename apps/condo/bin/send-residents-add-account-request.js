const conf = require('@core/config')

const { BillingProperty } = require('@condo/domains/billing/utils/serverSchema')

const { Message, Device } = require('@condo/domains/notification/utils/serverSchema')
const {
    RESIDENT_ADD_BILLING_ACCOUNT_TYPE,
    MESSAGE_SENT_STATUS, MESSAGE_DELIVERED_STATUS,
    MESSAGE_READ_STATUS, MESSAGE_ERROR_STATUS,
} = require('@condo/domains/notification/constants/constants')

const { Property } = require('@condo/domains/property/utils/serverSchema')

const { Resident, ServiceConsumer } = require('@condo/domains/resident/utils/serverSchema')

const { BillingContextScriptCore, runIt, mapFieldUnique, mapToUsers } = require('./lib/billing-context-script-core')

/**
 This script sends push notifications to all users who are:
     * residents of the properties:
        - of the organization with provided billingContextId
        - and have no accounts added
     * have available pushTokens
     * have not been sent this king of notifications during current month yet
 */
class ResidentsNotificationSender extends BillingContextScriptCore {
    async proceed () {
        const serviceConsumerWhere = { billingIntegrationContext: { id: this.billingContextId, deletedAt: null }, accountNumber_not: null, deletedAt: null }
        const serviceConsumers = await this.loadListByChunks(ServiceConsumer, serviceConsumerWhere)
        const consumerResidentIds = mapFieldUnique(serviceConsumers, 'resident.id')

        console.info('[INFO] residents with account numbers found:', consumerResidentIds.length)

        const billingPropertiesWhere = { deletedAt: null, context: { id: this.billingContextId, deletedAt: null } }
        const billingProperties = await this.loadListByChunks(BillingProperty, billingPropertiesWhere)
        const propertyAddresses = mapFieldUnique(billingProperties, 'address')

        console.info('[INFO] billing property addresses found within context:', propertyAddresses.length)

        /**
         *  Here we search for all non-deleted properties that are:
         *  - belong to the organization
         *  - match by address non-deleted BillingProperties related to BillingContext of the organization
         */
        const propertiesWhere = { deletedAt: null, organization: { id: this.billingContext.organization.id, deletedAt: null }, address_in: propertyAddresses }
        const properties = await this.loadListByChunks(Property, propertiesWhere)
        const propertyIds = mapFieldUnique(properties, 'id')

        console.info('[INFO] properties found matching addresses within organization billing properties:', propertyIds.length)

        const { thisMonthStart, nextMonthStart } = this.getMonthStart()
        const messagesWhere = {
            deletedAt: null,
            type_in: [this.messageType],
            status_in: [MESSAGE_SENT_STATUS, MESSAGE_DELIVERED_STATUS, MESSAGE_READ_STATUS, MESSAGE_ERROR_STATUS],
            createdAt_gte: thisMonthStart,
            createdAt_lt: nextMonthStart,
        }

        const messagesSent = await this.loadListByChunks(Message, messagesWhere)
        const sentUserIds = mapFieldUnique(messagesSent, 'user.id')

        console.info('[INFO] users that already had been sent notifications this month:', sentUserIds.length)

        /**
         * Here we are searching for all non-deleted residents that are:
         * - belong to organization of provided context
         * - haven't received notification of type RESIDENT_ADD_BILLING_ACCOUNT_TYPE yet this month
         * - aren't mentioned in ServiceConsumer relations
         */
        const residentsWhere = { deletedAt: null, property: { id_in: propertyIds }, user: { id_not_in: sentUserIds }, id_not_in: consumerResidentIds }
        const residents = await this.loadListByChunks(Resident, residentsWhere)
        const userIds = mapFieldUnique(properties, 'user.id')
        /**
         * We need userId -> residentId mapping
         */
        const userIdByResidentIds = mapToUsers(residents)

        console.info(`[INFO] ${userIds.length} users without notifications found among ${residents.length} residents.`)

        const devicesWhere = { deletedAt: null, pushToken_not: null, owner: { id_in: userIds } }
        const devices = await this.loadListByChunks(Device, devicesWhere)
        const deviceUserIds = mapFieldUnique(devices, 'owner.id')

        if (!this.forceSend) {
            console.info(`[INDO] ${deviceUserIds.length} users with pushTokens found to be sent notifications to among ${devices.length} devices.`)

            process.exit(0)
        }

        if (this.forceSend) {
            let count = 0
            const lang = await this.getOrganizationLocale()

            for (const userId of deviceUserIds) {
                count++

                const data = {
                    residentId: userIdByResidentIds[userId],
                    userId: userId,
                    url: `${conf.SERVER_URL}/billing/receipts/`,
                }

                await this.sendMessage(userId, lang, data)

                if (count >= this.maxSendCount) break
            }

            console.info(`[INFO] ${count} notifications ${!this.forceSend ? 'to be' : ''} sent.`)
        }
    }
}

runIt(ResidentsNotificationSender, RESIDENT_ADD_BILLING_ACCOUNT_TYPE).then()
