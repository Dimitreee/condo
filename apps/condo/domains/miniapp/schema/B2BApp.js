/**
 * Generated by `createschema miniapp.B2BApp 'name:Text;'`
 */

const { Text, Select, Relationship } = require('@keystonejs/fields')
const { GQLListSchema } = require('@core/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@core/keystone/plugins')
const { dvAndSender } = require('@condo/domains/common/schema/plugins/dvAndSender')
const access = require('@condo/domains/miniapp/access/B2BApp')
const {
    LOGO_FIELD,
    SHORT_DESCRIPTION_FIELD,
    DEVELOPER_FIELD,
    PARTNER_URL_FIELD,
    INSTRUCTION_TEXT_FIELD,
    CONNECTED_MESSAGE_FIELD,
    IFRAME_URL_FIELD,
    IS_HIDDEN_FIELD,
    CONTEXT_DEFAULT_STATUS_FIELD,
} = require('@condo/domains/miniapp/schema/fields/integration')
const {
    B2B_APP_CATEGORIES,
    OTHER_CATEGORY,
} = require('@condo/domains/miniapp/constants')
const { ABOUT_DOCUMENT_FIELD } = require('@condo/domains/miniapp/schema/fields/aboutDocumentField')


const B2BApp = new GQLListSchema('B2BApp', {
    schemaDoc: 'B2B app',
    fields: {
        name: {
            schemaDoc: 'Name of B2B App',
            type: Text,
            isRequired: true,
        },
        logo: LOGO_FIELD,
        shortDescription: SHORT_DESCRIPTION_FIELD,
        about: {
            ...ABOUT_DOCUMENT_FIELD,
            schemaDoc: `Information about promo-blocks which we'll be shown on app detailed page. ${ABOUT_DOCUMENT_FIELD.schemaDoc}`,
        },
        developer: DEVELOPER_FIELD,
        partnerUrl: PARTNER_URL_FIELD,
        instruction: INSTRUCTION_TEXT_FIELD,
        connectedMessage: CONNECTED_MESSAGE_FIELD,
        appUrl: IFRAME_URL_FIELD,
        isHidden: IS_HIDDEN_FIELD,
        contextDefaultStatus: CONTEXT_DEFAULT_STATUS_FIELD,
        category: {
            schemaDoc: `Category of app. Can be one of the following: [${B2B_APP_CATEGORIES.map(category => `"${category}"`).join(', ')}] By default set to "${OTHER_CATEGORY}"`,
            type: Select,
            dataType: 'string',
            isRequired: true,
            options: B2B_APP_CATEGORIES,
            defaultValue: OTHER_CATEGORY,
        },
        setupButtonMessage: {
            schemaDoc: 'Text, which will be displayed instead of default "Set up" text if app has it\'s own frontend (appUrl)',
            isRequired: false,
            type: Text,
        },
        accessRights: {
            schemaDoc: 'Specifies set of service users, who can access app\'s contexts related as well as perform actions on behalf of the application',
            type: Relationship,
            ref: 'B2BAppAccessRight.app',
            many: true,
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), historical(), dvAndSender()],
    access: {
        read: access.canReadB2BApps,
        create: access.canManageB2BApps,
        update: access.canManageB2BApps,
        delete: false,
        auth: true,
    },
})

module.exports = {
    B2BApp,
}