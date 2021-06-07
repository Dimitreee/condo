/**
 * Generated by `createschema ticket.TicketContact 'property:Relationship:Property:PROTECT; unitName:Text; email:Text; phone:Text; name:Text;' --force`
 */
const { checkOrganizationPermission } = require('@condo/domains/organization/utils/accessSchema')
const get = require('lodash/get')
const { getById } = require('@core/keystone/schema')

async function canReadTicketContacts ({ authentication: { item: user } }) {
    if (!user) return false
    if (user.isAdmin) return {}
    return {
        property: { organization: { employees_some: { user: { id: user.id }, isBlocked: false } } },
    }
}

async function canManageTicketContacts ({ authentication: { item: user }, originalInput, operation, itemId }) {
    if (!user) return false
    if (user.isAdmin) return true
    if (operation === 'create') {
        const propertyId = get(originalInput, ['property', 'connect', 'id'])
        const property = await getById('Property', propertyId)
        if (!property) {
            return false
        }
        const organizationIdFromProperty = get(property, 'organization')
        const canManageTicketContacts = await checkOrganizationPermission(user.id, organizationIdFromProperty, 'canManageTicketContacts')
        return  canManageTicketContacts
    } else if (operation === 'update') {
        const ticketContact = await getById('TicketContact', itemId)
        if (!ticketContact) {
            return false
        }
        const property = await getById('Property', ticketContact.property)
        if (!property) {
            return false
        }
        const canManageTicketContacts = await checkOrganizationPermission(user.id, property.organization, 'canManageTicketContacts')
        return canManageTicketContacts
    }
    return false
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadTicketContacts,
    canManageTicketContacts,
}
