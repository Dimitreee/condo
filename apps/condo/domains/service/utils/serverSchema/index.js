/**
 * Generated by `createschema service.Service 'name:Text; description?:Text; avatar?:Text; website?:Text; developer?:Text; type:Text; isHidden?:Checkbox; meta?:Json;'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */

const { generateServerUtils, execGqlWithoutAccess } = require('@condo/domains/common/utils/codegeneration/generate.server.utils')

const { Service: ServiceGQL } = require('@condo/domains/service/gql')
/* AUTOGENERATE MARKER <IMPORT> */

const Service = generateServerUtils(ServiceGQL)
/* AUTOGENERATE MARKER <CONST> */

module.exports = {
    Service,
/* AUTOGENERATE MARKER <EXPORTS> */
}
