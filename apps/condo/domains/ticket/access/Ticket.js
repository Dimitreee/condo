/**
 * Generated by `createschema ticket.Ticket organization:Text; statusReopenedCounter:Integer; statusReason?:Text; status:Relationship:TicketStatus:PROTECT; number?:Integer; client?:Relationship:User:SET_NULL; clientName:Text; clientEmail:Text; clientPhone:Text; operator:Relationship:User:SET_NULL; assignee?:Relationship:User:SET_NULL; classifier:Relationship:TicketClassifier:PROTECT; details:Text; meta?:Json;`
 */

const get = require('lodash/get')
const uniq = require('lodash/uniq')
const compact = require('lodash/compact')
const flatten = require('lodash/flatten')
const omit = require('lodash/omit')
const isEmpty = require('lodash/isEmpty')
const { queryOrganizationEmployeeFromRelatedOrganizationFor } = require('@condo/domains/organization/utils/accessSchema')
const { queryOrganizationEmployeeFor } = require('@condo/domains/organization/utils/accessSchema')
const { checkPermissionInUserOrganizationOrRelatedOrganization } = require('@condo/domains/organization/utils/accessSchema')
const { getById, find } = require('@core/keystone/schema')
const { throwAuthenticationError } = require('@condo/domains/common/utils/apolloErrorFormatter')
const { RESIDENT, STAFF } = require('@condo/domains/user/constants/common')
const { OrganizationEmployee } = require('@condo/domains/organization/utils/serverSchema')
const { Division, getUserDivisionsInfo } = require('@condo/domains/division/utils/serverSchema')

async function canReadTickets ({ authentication: { item: user }, context }) {
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
            organization: {
                id_in: uniq(organizationsIds),
                deletedAt: null,
            },
            OR: [
                { createdBy: { id: user.id } },
                ...residentAddressOrStatement,
            ],
        }
    }

    const userDivisionsInfo = await getUserDivisionsInfo(context, user.id)

    if (userDivisionsInfo) {
        const { organizationsIdsWithEmployeeInDivision, divisionsPropertiesIds } = userDivisionsInfo

        return {
            OR: [
                {
                    AND: [
                        {
                            organization: {
                                id_not_in: organizationsIdsWithEmployeeInDivision,
                                OR: [
                                    queryOrganizationEmployeeFor(user.id),
                                    queryOrganizationEmployeeFromRelatedOrganizationFor(user.id),
                                ],
                            },
                        },
                    ],
                },
                {
                    AND: [
                        {
                            organization: { id_in: organizationsIdsWithEmployeeInDivision },
                            OR: [
                                { property: { id_in: divisionsPropertiesIds } },
                                { executor: { id: user.id } },
                                { assignee: { id: user.id } },
                            ],
                        },
                    ],
                },
            ],
        }
    }

    return {
        organization: {
            OR: [
                queryOrganizationEmployeeFor(user.id),
                queryOrganizationEmployeeFromRelatedOrganizationFor(user.id),
            ],
        },
    }
}

async function canManageTickets ({ authentication: { item: user }, operation, itemId, originalInput }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin) return true
    let ticket

    if (user.type === RESIDENT) {
        let unitName, propertyId

        if (operation === 'create') {
            unitName = get(originalInput, 'unitName', null)
            propertyId = get(originalInput, ['property', 'connect', 'id'])
        } else if (operation === 'update') {
            if (!itemId) return false

            ticket = await getById('Ticket', itemId)
            if (!ticket) return false

            propertyId = get(ticket, 'property', null)
            unitName = get(ticket, 'unitName', null)
        }

        if (!unitName || !propertyId) return false

        const residents = await find('Resident', {
            user: { id: user.id },
            property: { id: propertyId, deletedAt: null },
            unitName,
            deletedAt: null,
        })

        if (residents.length === 0) {
            return false
        }

        if (operation === 'create') {
            return true
        } else if (operation === 'update') {
            let inaccessibleUpdatedFields

            if (ticket.createdBy === user.id) {
                inaccessibleUpdatedFields = omit(originalInput, ['dv', 'sender', 'details', 'reviewValue', 'reviewComment'])
            } else {
                const ticketContactId = get(ticket, 'contact')
                if (!ticket.canReadByResident) return false
                if (!ticketContactId) return false

                const ticketContact = await getById('Contact', ticketContactId)
                if (user.phone !== ticketContact.phone) {
                    return false
                }

                const residentMatchesTicketContact = residents.find(resident =>
                    resident.property === ticketContact.property && resident.unitName === ticketContact.unitName
                )
                if (!residentMatchesTicketContact) {
                    return false
                }

                inaccessibleUpdatedFields = omit(originalInput, ['dv', 'sender', 'reviewValue', 'reviewComment'])
            }

            return isEmpty(inaccessibleUpdatedFields)
        }
    }
    if (user.type === STAFF) {
        let organizationId

        if (operation === 'create') {
            organizationId = get(originalInput, ['organization', 'connect', 'id'])
        } else if (operation === 'update') {
            if (!itemId) return false
            const ticket = await getById('Ticket', itemId)
            organizationId = get(ticket, 'organization', null)
        }

        const permission = await checkPermissionInUserOrganizationOrRelatedOrganization(user.id, organizationId, 'canManageTickets')
        if (!permission) return false

        const propertyId = get(originalInput, ['property', 'connect', 'id'], null)
        if (propertyId) {
            const property = await getById('Property', propertyId)
            if (!property) return false

            return organizationId === get(property, 'organization')
        }

        return true
    }

    return false
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadTickets,
    canManageTickets,
}
