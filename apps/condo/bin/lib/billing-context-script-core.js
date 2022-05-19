const dayjs = require('dayjs')
const path = require('path')
const get = require('lodash/get')
const map = require('lodash/map')
const isEmpty = require('lodash/isEmpty')

const { BillingIntegrationOrganizationContext } = require('@condo/domains/billing/utils/serverSchema')
const { BILLING_INTEGRATION_ORGANIZATION_CONTEXT_FINISHED_STATUS } = require('@condo/domains/billing/constants/constants')

const { SendPushScriptCore, runMain } = require('./send-push-script-core')
const { Organization } = require('@condo/domains/organization/utils/serverSchema')
const { COUNTRIES, DEFAULT_LOCALE } = require('@condo/domains/common/constants/countries')

const EXEC_COMMAND = 'yarn workspace @app/condo node'
const BASE_NAME = path.posix.basename(process.argv[1])
const MAX_SEND_COUNT = 100

class BillingContextScriptCore extends SendPushScriptCore {
    constructor ({ messageType, periodRaw, billingContextId, forceSend, maxSendCount }, withPeriod = false) {
        super({ messageType })

        this.withPeriod = withPeriod

        this.checkArgs(billingContextId, periodRaw)

        this.period = this.getPeriod(periodRaw)
        this.billingContextId = billingContextId
        this.forceSend = forceSend
        this.maxSendCount = maxSendCount
        this.billingContext = null
        this.organization = null
        this.locale = null
    }

    /**
     * Checks CLI args values and consistency
     * @param billingContextId
     * @param periodRaw
     */
    checkArgs (billingContextId, periodRaw) {
        console.info('\r\n')

        if (this.withPeriod) {
            if (!periodRaw || !billingContextId) {
                throw new Error(`No period and billingContextId were provided – please execute like following: ${EXEC_COMMAND} ./bin/${BASE_NAME} <period> <contextId> [FORCE_SEND] [<maxSendCount>]`)
            }

            if (!dayjs(periodRaw).isValid()) {
                throw new Error('Incorrect period format was provided. Expected: YYYY-MM-01')
            }
        } else {
            if (!billingContextId) {
                throw new Error(`No billingContextId was provided – please execute like following: ${EXEC_COMMAND} ./bin/${BASE_NAME} <contextId> [FORCE_SEND] [<maxSendCount>]`)
            }
        }
    }

    /**
     * Returns period prepared and formatted properly
     * @param periodRaw
     * @returns {*}
     */
    getPeriod (periodRaw) {
        return dayjs(periodRaw).date(1).format('YYYY-MM-DD')
    }

    /**
     * Requests BillingIntegrationContext data
     * @returns {Promise<void>}
     */
    async testContext () {
        try {
            const billingContext = await BillingIntegrationOrganizationContext.getOne(this.context, { id: this.billingContextId, status: BILLING_INTEGRATION_ORGANIZATION_CONTEXT_FINISHED_STATUS })

            if (isEmpty(billingContext)) throw new Error(`Provided billingContextId not found or status is not ${BILLING_INTEGRATION_ORGANIZATION_CONTEXT_FINISHED_STATUS}`)

            this.billingContext = billingContext
        } catch (e) {
            console.error(e)

            throw new Error(`Provided billingContextId was invalid ${this.billingContextId}`)
        }
    }

    /**
     * Detect message language by lazy loading organization data and extracting country info from it
     * Use DEFAULT_LOCALE if organization.country is unknown
     * (not defined within @condo/domains/common/constants/countries)
     */
    async getOrganizationLocale () {
        if (!this.organization) this.organization = await Organization.getOne(this.context, { id: this.billingContext.organization.id, deletedAt: null })
        if (!this.locale) this.locale = get(COUNTRIES, get(this.organization, 'country.locale'), DEFAULT_LOCALE)

        return this.locale
    }

    getMonthStart () {
        return {
            thisMonthStart: dayjs().date(1).format('YYYY-MM-DD'),
            nextMonthStart: dayjs().date(1).date(40).date(1).format('YYYY-MM-DD'),
        }
    }
}

/**
 * Initializes instance of given class by CLI args, prepares all connections, runs all checks, then executes proceed method
 * @param Constructor
 * @param messageType
 * @param withPeriod
 * @returns {Promise<void>}
 */
async function runIt (Constructor, messageType, withPeriod = false) {
    const main = withPeriod
        ? async function ([periodRaw, billingContextId, forceSendFlag, maxSendCount = MAX_SEND_COUNT]) {
            const forceSend = forceSendFlag === 'FORCE_SEND'
            const instance = new Constructor({ messageType, billingContextId, periodRaw, forceSend, maxSendCount }, withPeriod)

            await instance.connect()
            await instance.testContext()
            await instance.proceed()
        }
        : async function ([billingContextId, forceSendFlag, maxSendCount = MAX_SEND_COUNT]) {
            const forceSend = forceSendFlag === 'FORCE_SEND'
            const instance = new Constructor({ messageType, billingContextId, forceSend, maxSendCount })

            await instance.connect()
            await instance.testContext()
            await instance.proceed()
        }

    runMain(main)
}

/**
 * Selects unique field values from array of objects by given path
 * @param list
 * @param fieldPath
 * @returns {unknown[]}
 */
const mapFieldUnique = (list, fieldPath) => [...new Set(map(list, fieldPath))]

/**
 * Maps array of objects as { [<userIdX>] : [<itemIdY>], ... }
 * @param items
 */
const mapToUsers = (items) => items.reduce(
    (acc, item) => {
        acc[get(item, 'user.id')] = get(item, 'id')

        return acc
    },
    {}
)


module.exports = {
    BillingContextScriptCore,
    runIt,
    mapFieldUnique,
    mapToUsers,
}