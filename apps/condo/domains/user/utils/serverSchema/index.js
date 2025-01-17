/**
 * Generated by `createschema user.User name:Text; password?:Password; isAdmin?:Checkbox; email?:Text; isEmailVerified?:Checkbox; phone?:Text; isPhoneVerified?:Checkbox; avatar?:File; meta:Json; importId:Text;`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */

const { OrganizationEmployee } = require('@condo/domains/organization/utils/serverSchema')
const has = require('lodash/has')
const faker = require('faker')
const {
    SMS_CODE_LENGTH,
} = require('@condo/domains/user/constants/common')
const { execGqlWithoutAccess } = require('@condo/domains/common/utils/codegeneration/generate.server.utils')
const { generateServerUtils } = require('@condo/domains/common/utils/codegeneration/generate.server.utils')

const { User: UserGQL } = require('@condo/domains/user/gql')
const { ConfirmPhoneAction: ConfirmPhoneActionGQL } = require('@condo/domains/user/gql')
const { ForgotPasswordAction: ForgotPasswordActionGQL } = require('@condo/domains/user/gql')
const { SIGNIN_AS_USER_MUTATION } = require('@condo/domains/user/gql')
const { REGISTER_NEW_SERVICE_USER_MUTATION } = require('@condo/domains/user/gql')
const { SEND_MESSAGE_TO_SUPPORT_MUTATION } = require('@condo/domains/user/gql')
const { RESET_USER_MUTATION } = require('@condo/domains/user/gql')
/* AUTOGENERATE MARKER <IMPORT> */

const User = generateServerUtils(UserGQL)
const ConfirmPhoneAction = generateServerUtils(ConfirmPhoneActionGQL)
const ForgotPasswordAction = generateServerUtils(ForgotPasswordActionGQL)

async function signinAsUser (context, data) {
    if (!context) throw new Error('no context')
    if (!data) throw new Error('no data')
    if (!data.sender) throw new Error('no data.sender')
    if (!data.id)  throw new Error('no data.id')
    return await execGqlWithoutAccess(context, {
        query: SIGNIN_AS_USER_MUTATION,
        variables: { data: { dv: 1, ...data } },
        errorMessage: '[error] Unable to signinAsUser',
        dataPath: 'result',
    })
}

async function registerNewServiceUser (context, data) {
    if (!context) throw new Error('no context')
    if (!data) throw new Error('no data')
    if (!data.sender) throw new Error('no data.sender')
    return await execGqlWithoutAccess(context, {
        query: REGISTER_NEW_SERVICE_USER_MUTATION,
        variables: { data: { dv: 1, ...data } },
        errorMessage: '[error] Unable to registerNewUserService',
        dataPath: 'obj',
    })
}

async function resetUser (context, data) {
    if (!context) throw new Error('no context')
    if (!data) throw new Error('no data')
    if (!data.sender) throw new Error('no data.sender')

    return await execGqlWithoutAccess(context, {
        query: RESET_USER_MUTATION,
        variables: { data: { dv: 1, ...data } },
        errorMessage: '[error] Unable to resetUser',
        dataPath: 'obj',
    })
}

async function sendMessageToSupport (context, data) {
    if (!context) throw new Error('no context')
    if (!data) throw new Error('no data')
    if (!data.sender) throw new Error('no data.sender')

    return await execGqlWithoutAccess(context, {
        query: SEND_MESSAGE_TO_SUPPORT_MUTATION,
        variables: { data: { dv: 1, ...data } },
        errorMessage: '[error] Unable to sendMessageToSupport',
        dataPath: 'obj',
    })
}

/* AUTOGENERATE MARKER <CONST> */

const conf = require('@core/config')
const whiteList = conf.SMS_WHITE_LIST ? JSON.parse(conf.SMS_WHITE_LIST) : {}


const generateSmsCode = (phone) => {
    if (has(whiteList, phone)) { // Emulate Firebase white list for development - no real send sms
        return Number(whiteList[phone])
    }
    return faker.datatype.number({
        min: Math.pow(10, SMS_CODE_LENGTH - 1), // example 6 symbols:  min = 10^(6-1) = 100000
        max: Math.pow(10, SMS_CODE_LENGTH) - 1, // max = 10^6-1 = 999999
    })
}

const updateEmployeesRelatedToUser = async (context, user) => {
    const acceptedInviteEmployees = await OrganizationEmployee.getAll(context, { user: { id: user.id }, isAccepted: true })
    if (acceptedInviteEmployees.length > 0) {
        acceptedInviteEmployees.forEach(employee => {
            OrganizationEmployee.update(context, employee.id, {
                dv: user.dv,
                sender: user.sender,
                name: user.name,
                email: user.email,
                phone: user.phone,
            })
        })
    }
}


module.exports = {
    User,
    ConfirmPhoneAction,
    generateSmsCode,
    ForgotPasswordAction,
    updateEmployeesRelatedToUser,
    signinAsUser,
    registerNewServiceUser,
    sendMessageToSupport,
    resetUser,
/* AUTOGENERATE MARKER <EXPORTS> */
}
