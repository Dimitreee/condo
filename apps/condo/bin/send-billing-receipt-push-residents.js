const conf = require('@core/config')

const { BillingReceipt, BillingProperty } = require('@condo/domains/billing/utils/serverSchema')

const { Message, Device } = require('@condo/domains/notification/utils/serverSchema')
const {
    BILLING_RECEIPT_AVAILABLE_TYPE,
    BILLING_RECEIPT_AVAILABLE_NO_ACCOUNT_TYPE,
    MESSAGE_SENT_STATUS, MESSAGE_DELIVERED_STATUS,
    MESSAGE_READ_STATUS, MESSAGE_ERROR_STATUS,
} = require('@condo/domains/notification/constants/constants')

const { Property } = require('@condo/domains/property/utils/serverSchema')

const { Resident } = require('@condo/domains/resident/utils/serverSchema')

const { BillingContextScriptCore, runIt, mapFieldUnique, mapToUsers } = require('./lib/billing-context-script-core')

// These are needed temporarily for backwards compatibility in order not to add extra migrations
const BILLING_RECEIPT_AVAILABLE_MANUAL_TYPE = 'BILLING_RECEIPT_AVAILABLE_MANUAL'
const BILLING_RECEIPT_AVAILABLE_NO_ACCOUNT_MANUAL_TYPE = 'BILLING_RECEIPT_AVAILABLE_NO_ACCOUNT_MANUAL'

/**
 This script sends push notifications to all users who are:
     * residents of the properties:
        - of the organization with provided billingContextId
        - having at least one billing receipt for provided period on the property
     * have available pushTokens
     * have not been sent this king of notifications during current month yet
 */
class ResidentsNotificationSender extends BillingContextScriptCore {
    async proceed () {
        const receiptsWhere = { context: { id: this.billingContextId, deletedAt: null }, period_in: [this.period], deletedAt: null }
        const receipts = await this.loadListByChunks(BillingReceipt, receiptsWhere)

        if (!receipts.length) {
            console.error('No BillingReceipt records found for provided billingContextId and period')

            process.exit(1)
        }

        console.info(`[INFO] ${receipts.length} Receipt rows found.`)

        const billingPropertyIds = mapFieldUnique(receipts, 'property.id')

        const billingPropertiesWhere = { deletedAt: null, id_in: billingPropertyIds }
        const billingProperties = await this.loadListByChunks(BillingProperty, billingPropertiesWhere)

        console.info(`[INFO] ${billingProperties.length} BillingProperty rows found for ${billingPropertyIds.length} ids:`, billingPropertyIds)

        const propertyAddresses = mapFieldUnique(billingProperties, 'address')

        console.info(`[INFO] ${propertyAddresses.length} addresses found:`, propertyAddresses)

        const propertiesWhere = { deletedAt: null, address_in: propertyAddresses }
        const properties = await this.loadListByChunks(Property, propertiesWhere)

        const propertyIds = mapFieldUnique(properties, 'id')

        console.info(`[INFO] ${propertyIds.length} properties found for ${propertyAddresses.length} addresses`)

        const { thisMonthStart, nextMonthStart } = this.getMonthStart()
        const messagesWhere = {
            deletedAt: null,
            type_in: [
                BILLING_RECEIPT_AVAILABLE_TYPE,
                BILLING_RECEIPT_AVAILABLE_NO_ACCOUNT_TYPE,
                BILLING_RECEIPT_AVAILABLE_MANUAL_TYPE,
                BILLING_RECEIPT_AVAILABLE_NO_ACCOUNT_MANUAL_TYPE,
            ],
            status_in: [MESSAGE_SENT_STATUS, MESSAGE_DELIVERED_STATUS, MESSAGE_READ_STATUS, MESSAGE_ERROR_STATUS],
            createdAt_gte: thisMonthStart,
            createdAt_lt: nextMonthStart,
        }

        const messagesSent = await this.loadListByChunks(Message, messagesWhere)
        const sentUserIds = mapFieldUnique(messagesSent, 'user.id')

        console.info(`[INFO] ${sentUserIds.length} users already received notifications.`)

        console.info('[INFO] Reading residents info.')

        const residentsWhere = { deletedAt: null, property: { id_in: propertyIds }, user: { id_not_in: sentUserIds } }
        const residents = await this.loadListByChunks(Resident, residentsWhere)

        // get only users, whom we didn't send notifications within current month yet.
        const userIds = mapFieldUnique(residents, 'user.id')
        const userIdByResidentIds = mapToUsers(residents)

        console.info(`[INFO] ${userIds.length} users without notifications found among ${residents.length} residents.`)

        const devicesWhere = { deletedAt: null, pushToken_not: null, owner: { id_in: userIds } }
        const devices = await this.loadListByChunks(Device, devicesWhere)
        const deviceUserIds = mapFieldUnique(devices, 'owner.id')

        if (!this.forceSend) {
            console.info(`[INFO] ${deviceUserIds.length} users with pushTokens found to be sent notifications to among ${devices.length} devices.`)

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

runIt(ResidentsNotificationSender, BILLING_RECEIPT_AVAILABLE_NO_ACCOUNT_TYPE, true).then()
