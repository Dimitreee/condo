/**
 * Generated by `createschema onboarding.OnBoarding 'completed:Checkbox; stepsTransitions:Json;'`
 */

const { throwAuthenticationError } = require('@condo/domains/common/utils/apolloErrorFormatter')
const { getById } = require('@core/keystone/schema')
const get = require('lodash/get')

async function canReadOnBoardings ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    return {
        user: { id: user.id },
    }
}

async function canManageOnBoardings ({ authentication: { item: user }, itemId, operation, originalInput }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false

    if (operation === 'create') {
        const userId = get(originalInput, ['user', 'connect', 'id'])
        if (!userId) return false
        return userId === user.id
    } else if (operation === 'update') {
        const obj = await getById('OnBoarding', itemId)
        if (!obj) return false
        return obj.user === user.id
    }
    return false
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadOnBoardings,
    canManageOnBoardings,
}
