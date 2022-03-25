const { Text, File, Relationship } = require('@keystonejs/fields')
const FileAdapter = require('@condo/domains/common/utils/fileAdapter')
const { Markdown } = require('@keystonejs/fields-markdown')

const APPS_FILE_ADAPTER = new FileAdapter('apps')

const DEVELOPER_FIELD = {
    schemaDoc: 'Developer company name',
    type: Text,
    isRequired: true,
}

const LOGO_FIELD = {
    schemaDoc: 'Integration company logo',
    type: File,
    isRequired: false,
    adapter: APPS_FILE_ADAPTER,
}

const PARTNER_URL_FIELD = {
    schemaDoc: 'Integration company website',
    type: Text,
    isRequired: false,
}

const APP_IMAGE_FIELD = {
    schemaDoc: 'Image',
    type: File,
    isRequired: true,
    adapter: APPS_FILE_ADAPTER,
}

const DESCRIPTION_BLOCKS_FIELD = {
    schemaDoc: 'Link to app description blocks if exists...You can control order of appearance in CRM by specifying theirs order parameter',
    type: Relationship,
    ref: 'DescriptionBlock',
    isRequired: false,
    many: true,
}

const SHORT_DESCRIPTION_FIELD = {
    schemaDoc: 'Short integration description, that would be shown on settings card',
    type: Text,
    isRequired: true,
}

const INSTRUCTION_TEXT_FIELD = {
    schemaDoc: 'Text which used to describe how to connect app written in markdown',
    type: Markdown,
    isRequired: false,
}

const IFRAME_URL_FIELD = {
    schemaDoc: 'Url to app page, which will is app starting point and will be opened in iframe',
    type: Text,
    isRequired: false,
}

module.exports = {
    DEVELOPER_FIELD,
    LOGO_FIELD,
    PARTNER_URL_FIELD,
    APP_IMAGE_FIELD,
    DESCRIPTION_BLOCKS_FIELD,
    SHORT_DESCRIPTION_FIELD,
    INSTRUCTION_TEXT_FIELD,
    IFRAME_URL_FIELD,
}
