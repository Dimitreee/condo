/**
 * Generated by `createschema ticket.TicketClassifierRule 'organization?:Relationship:Organization:CASCADE;place?:Relationship:TicketPlaceClassifier:PROTECT;category?:Relationship:TicketCategoryClassifier:PROTECT;problem?:Relationship:TicketProblemClassifier:PROTECT;'`
 */

const { Relationship } = require('@keystonejs/fields')
const { GQLListSchema } = require('@core/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@core/keystone/plugins')
const { SENDER_FIELD, DV_FIELD } = require('@condo/domains/common/schema/fields')
const access = require('@condo/domains/ticket/access/TicketClassifierRule')
const { COMMON_AND_ORGANIZATION_OWNED_FIELD } = require('../../../schema/_common')

const TicketClassifierRule = new GQLListSchema('TicketClassifierRule', {
    schemaDoc: 'Rules for  all possible valid combinations of classifiers',
    fields: {
        dv: DV_FIELD,
        sender: SENDER_FIELD,
        organization: COMMON_AND_ORGANIZATION_OWNED_FIELD,
        place: {
            schemaDoc: 'Location of incident',
            type: Relationship,
            ref: 'TicketPlaceClassifier',
            kmigratorOptions: { null: true, on_delete: 'models.PROTECT' },
        },
        category: {
            schemaDoc: 'Type of work to fix incident',
            type: Relationship,
            ref: 'TicketCategoryClassifier',
            kmigratorOptions: { null: true, on_delete: 'models.PROTECT' },
        },
        description: {
            schemaDoc: 'What needs to be done',
            type: Relationship,
            ref: 'TicketProblemClassifier',
            kmigratorOptions: { null: true, on_delete: 'models.PROTECT' },
        },

    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), historical()],
    access: {
        read: access.canReadTicketClassifierRules,
        create: access.canManageTicketClassifierRules,
        update: access.canManageTicketClassifierRules,
        delete: false,
        auth: true,
    },
})

module.exports = {
    TicketClassifierRule,
}
