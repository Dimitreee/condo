/**
 * Generated by `createschema ticket.TicketComment 'ticket:Relationship:Ticket:CASCADE; user:Relationship:User:CASCADE; content:Text;'`
 */

const get = require('lodash/get')
const { throwAuthenticationError } = require('@condo/domains/common/utils/apolloErrorFormatter')
const { queryOrganizationEmployeeFromRelatedOrganizationFor } = require('@condo/domains/organization/utils/accessSchema')
const { queryOrganizationEmployeeFor } = require('@condo/domains/organization/utils/accessSchema')
const { checkPermissionInUserOrganizationOrRelatedOrganization } = require('@condo/domains/organization/utils/accessSchema')
const { getByCondition, find, getById } = require('@core/keystone/schema')
const { RESIDENT, STAFF } = require('@condo/domains/user/constants/common')
const isEmpty = require('lodash/isEmpty')
const compact = require('lodash/compact')
const uniq = require('lodash/uniq')
const omit = require('lodash/omit')
const { COMMENT_TYPE, COMPLETED_STATUS_TYPE, CANCELED_STATUS_TYPE } = require('../constants')

async function canReadTicketComments ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    
    if (user.isSupport || user.isAdmin) return {}

    if (user.type === RESIDENT) {
        const residents = await find('Resident', { user: { id: user.id }, deletedAt: null })

        if (isEmpty(residents)) return false

        const organizationsIds = compact(residents.map(resident => get(resident, 'organization')))
        const residentAddressOrStatement = residents.map(resident =>
            ({ AND: [{ canReadByResident: true, contact: { phone: user.phone } }, { property: { id: resident.property } }, { unitName: resident.unitName }] }))

        return {
            type: COMMENT_TYPE.RESIDENT,
            ticket: {
                organization: {
                    id_in: uniq(organizationsIds),
                    deletedAt: null,
                },
                OR: [
                    { createdBy: { id: user.id } },
                    ...residentAddressOrStatement,
                ],
            },
        }
    }

    return {
        ticket: {
            organization: {
                OR: [
                    queryOrganizationEmployeeFor(user.id),
                    queryOrganizationEmployeeFromRelatedOrganizationFor(user.id),
                ],
            },
        },
    }
}

async function canManageTicketComments ({ authentication: { item: user }, originalInput, operation, itemId }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin) return true

    if (user.type === RESIDENT) {
        let ticket, commentType

        if (operation === 'create') {
            const ticketId = get(originalInput, ['ticket', 'connect', 'id'])
            ticket = await getByCondition('Ticket', { id: ticketId, deletedAt: null })
            commentType = get(originalInput, 'type')
        } else if (operation === 'update' && itemId) {
            const comment = await getByCondition('TicketComment', { id: itemId, deletedAt: null })
            if (!comment || comment.user !== user.id) return false

            ticket = await getByCondition('Ticket', { id: comment.ticket, deletedAt: null })
            if (!ticket) return false

            const inaccessibleUpdatedFields = omit(originalInput, ['dv', 'sender', 'content'])
            if (!isEmpty(inaccessibleUpdatedFields)) return false

            commentType = get(comment, 'type')
        }

        if (!ticket || !commentType || commentType !== COMMENT_TYPE.RESIDENT) return false

        const ticketStatusId = get(ticket, 'status')
        const ticketStatus = await getById('TicketStatus', ticketStatusId)
        if (ticketStatus.type === COMPLETED_STATUS_TYPE || ticketStatus.type === CANCELED_STATUS_TYPE) {
            return false
        }

        const propertyId = get(ticket, 'property', null)
        const unitName = get(ticket, 'unitName', null)

        const residents = await find('Resident', {
            user: { id: user.id },
            property: { id: propertyId, deletedAt: null },
            unitName,
            deletedAt: null,
        })

        return residents.length > 0
    }
    else if (user.type === STAFF) {
        if (operation === 'create') {
            const ticketId = get(originalInput, ['ticket', 'connect', 'id'])
            const ticket = await getByCondition('Ticket', { id: ticketId, deletedAt: null })
            if (!ticket) return false
            const organizationId = get(ticket, 'organization')

            return await checkPermissionInUserOrganizationOrRelatedOrganization(user.id, organizationId, 'canManageTicketComments')
        } else if (operation === 'update' && itemId) {
            const comment = await getByCondition('TicketComment', { id: itemId, deletedAt: null })
            if (!comment || comment.user !== user.id) return false
            const ticket = await getByCondition('Ticket', { id: comment.ticket, deletedAt: null })
            if (!ticket) return false
            const organizationId = get(ticket, 'organization')

            return await checkPermissionInUserOrganizationOrRelatedOrganization(user.id, organizationId, 'canManageTicketComments')
        }
    }

    return false
}

async function canSetUserField ({ authentication: { item: user }, originalInput }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin) return true

    return get(originalInput, ['user', 'connect', 'id']) === user.id
}

async function canReadUserField ({ authentication: { item: user }, existingItem }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin || user.type === STAFF) return true

    return get(existingItem, 'user') === user.id
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadTicketComments,
    canManageTicketComments,
    canSetUserField,
    canReadUserField,
}
