/**
 * Generated by `createschema subscription.ServiceSubscription 'type:Text; isTrial:Checkbox; organization:Relationship:Organization:CASCADE; startAt:DateTimeUtc; finishAt:DateTimeUtc;'`
 */

const { Text, Select, Checkbox, DateTimeUtc, Integer, Decimal } = require('@keystonejs/fields')
const { GQLListSchema } = require('@core/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@core/keystone/plugins')
const { SENDER_FIELD, DV_FIELD } = require('@condo/domains/common/schema/fields')
const access = require('@condo/domains/subscription/access/ServiceSubscription')
const { ORGANIZATION_OWNED_FIELD } = require('../../../schema/_common')
const { ServiceSubscription: ServiceSubscriptionAPI } = require('../utils/serverSchema')
const get = require('lodash/get')
const { OVERLAPPING_ERROR } = require('../constants/errors')
const { hasDvAndSenderFields } = require('@condo/domains/common/utils/validation.utils')
const { DV_UNKNOWN_VERSION_ERROR } = require('@condo/domains/common/constants/errors')


const ServiceSubscription = new GQLListSchema('ServiceSubscription', {
    schemaDoc: 'Availability time period of service features for client organization. Can be trial or payed.',
    fields: {
        dv: DV_FIELD,
        sender: SENDER_FIELD,

        type: {
            schemaDoc: 'System, from where subscription was created (our or external)',
            type: Select,
            options: 'default,sbbol',
            isRequired: true,
        },

        isTrial: {
            schemaDoc: 'Trial mode of subscription',
            type: Checkbox,
            isRequired: true,
        },

        organization: ORGANIZATION_OWNED_FIELD,

        startAt: {
            schemaDoc: 'When subscription was started',
            type: DateTimeUtc,
            isRequired: true,
        },

        finishAt: {
            schemaDoc: 'When subscription should be ended',
            type: DateTimeUtc,
            isRequired: true,
        },

        unitsCount: {
            schemaDoc: 'How much units are payed for this subscription',
            type: Integer,
        },

        unitPrice: {
            schemaDoc: 'How much one unit cost in Rubles for this subscription',
            type: Decimal,
            knexOptions: {
                scale: 2,
            },
        },

        totalPrice: {
            schemaDoc: 'Total price of this subscription, calculated as unitCost * unitsPayed',
            type: Decimal,
            knexOptions: {
                scale: 2,
            },
            hooks: {
                resolveInput: async ({ operation, resolvedData, existingItem }) => {
                    const isTrial = operation === 'create' ? resolvedData.isTrial : existingItem.isTrial
                    if (isTrial) {
                        return null
                    }
                    const unitPrice = resolvedData.unitPrice
                    const unitsCount = resolvedData.unitsCount
                    return unitPrice * unitsCount
                },
            },
        },

        currency: {
            schemaDoc: 'Currency of values for all price fields',
            type: Text,
            // There is possible a bug in Knex, that creates `NOT NULL` constraint if `defaultValue` field config is provided
            // Because it does not needs to be required, the line below is commented
            // defaultValue: 'RUB',
            isRequired: false,
        },

    },
    kmigratorOptions: {
        constraints: [
            {
                type: 'models.CheckConstraint',
                check: 'Q(type__in=["default", "sbbol"])',
                name: 'type_check',
            },
            {
                type: 'models.CheckConstraint',
                check: 'Q(startAt__lt=models.F("finishAt"))',
                name: 'startAt_is_before_finishAt',
            },
            {
                type: 'models.CheckConstraint',
                check: 'Q(currency__in=["RUB"])',
                name: 'currency_check',
            },
            {
                type: 'models.CheckConstraint',
                check: '(Q(isTrial=True) & Q(unitsCount__isnull=True) & Q(unitPrice__isnull=True) & Q(totalPrice__isnull=True) & Q(currency__isnull=True)) | (Q(isTrial=False) & Q(unitsCount__isnull=False) & Q(unitsCount__gt=0) & Q(unitPrice__isnull=False) & Q(unitPrice__gt=0) & Q(totalPrice__isnull=False) & Q(totalPrice__gt=0) & Q(currency__isnull=False))',
                name: 'prices_check',
            },
        ],
    },
    hooks: {
        validateInput: async ({ resolvedData, operation, existingItem, addValidationError, context }) => {
            if (!hasDvAndSenderFields( resolvedData, context, addValidationError)) return
            const { dv } = resolvedData
            if (dv === 1) {
                // NOTE: version 1 specific translations. Don't optimize this logic
            } else {
                return addValidationError(`${DV_UNKNOWN_VERSION_ERROR}dv] Unknown \`dv\``)
            }

            // It makes no sense:
            // - To create subscription in past
            let organizationId
            let overlappedSubscriptionsCount
            const ovelappingConditions = {
                OR: [
                    { startAt_gte: resolvedData.startAt },
                    { finishAt_gte: resolvedData.startAt },
                ],
            }
            const scopeConditions = {}
            if (operation === 'create') {
                organizationId = get(resolvedData, 'organization')
            } else if (operation === 'update') {
                organizationId = get(existingItem, 'organization')
                scopeConditions.id_not = existingItem.id
            }
            if (!organizationId) {
                throw new Error('No organization set for ServiceSubscription')
            }
            scopeConditions.organization = { id: organizationId }
            overlappedSubscriptionsCount = await ServiceSubscriptionAPI.count(context, {
                ...ovelappingConditions,
                ...scopeConditions,
            })
            if (overlappedSubscriptionsCount > 0) {
                return addValidationError(`${OVERLAPPING_ERROR} subscription for current organization overlaps already existing by its time period`)
            }
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), historical()],
    access: {
        read: access.canReadServiceSubscriptions,
        create: access.canManageServiceSubscriptions,
        update: access.canManageServiceSubscriptions,
        delete: false,
        auth: true,
    },
})

module.exports = {
    ServiceSubscription,
}
