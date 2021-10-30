/**
 * Generated by `createschema acquiring.AcquiringIntegration 'name:Text;'`
 */

const { Text, Relationship, Checkbox } = require('@keystonejs/fields')
const { GQLListSchema } = require('@core/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@core/keystone/plugins')
const { SENDER_FIELD, DV_FIELD } = require('@condo/domains/common/schema/fields')
const access = require('@condo/domains/acquiring/access/AcquiringIntegration')


const AcquiringIntegration = new GQLListSchema('AcquiringIntegration', {
    schemaDoc: 'Information about `acquiring component` which will generate `billing receipts` and `payments`',
    fields: {
        dv: DV_FIELD,
        sender: SENDER_FIELD,

        name: {
            schemaDoc: 'Name of `acquiring component`, which is set up by developer',
            type: Text,
            isRequired: true,
        },

        accessRights: {
            type: Relationship,
            ref: 'AcquiringIntegrationAccessRight.integration',
            many: true,
        },

        canGroupReceipts: {
            schemaDoc: 'Can multiple receipts be united through this acquiring',
            type: Checkbox,
            defaultValue: false,
            knexOptions: { isNotNullable: false },
            isRequired: true,
        },
        
        hostUrl: {
            schemaDoc: 'Url to acquiring integration service. Mobile devices will use it communicate with external acquiring. List of endpoints are the same for all of them.',
            type: Text,
            isRequired: true,
        },

        supportedBillingIntegrations: {
            schemaDoc: 'List of supported billing integrations. If one of them is here, it means that this acquiring can accept receipts from it',
            type: Relationship,
            ref: 'BillingIntegration',
            isRequired: true,
            many: true,
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), historical()],
    access: {
        read: access.canReadAcquiringIntegrations,
        create: access.canManageAcquiringIntegrations,
        update: access.canManageAcquiringIntegrations,
        delete: false,
        auth: true,
    },
})

module.exports = {
    AcquiringIntegration,
}
