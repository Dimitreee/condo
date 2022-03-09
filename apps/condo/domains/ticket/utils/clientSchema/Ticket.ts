/**
 * Generated by `createschema ticket.Ticket organization:Text; statusReopenedCounter:Integer; statusReason?:Text; status:Relationship:TicketStatus:PROTECT; number?:Integer; client?:Relationship:User:SET_NULL; clientName:Text; clientEmail:Text; clientPhone:Text; operator:Relationship:User:SET_NULL; assignee?:Relationship:User:SET_NULL; classifier:Relationship:TicketClassifier:PROTECT; details:Text; meta?:Json;`
 */

import { pick, get } from 'lodash'

import { getClientSideSenderInfo } from '@condo/domains/common/utils/userid.utils'
import { generateReactHooks } from '@condo/domains/common/utils/codegeneration/generate.hooks'

import { Ticket as TicketGQL } from '@condo/domains/ticket/gql'
import { Ticket, TicketUpdateInput, Organization, QueryAllTicketsArgs } from '@app/condo/schema'
import dayjs from 'dayjs'

const FIELDS = ['id', 'canReadByResident', 'deadline', 'deletedAt', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy', 'organization', 'statusReopenedCounter', 'statusReason', 'statusUpdatedAt', 'status', 'number', 'client', 'clientName', 'clientEmail', 'clientPhone', 'contact', 'unitType', 'unitName', 'sectionName', 'floorName', 'watchers', 'operator', 'assignee', 'classifier', 'placeClassifier', 'categoryClassifier', 'problemClassifier', 'classifierRule', 'details', 'related', 'isEmergency', 'isWarranty', 'isPaid', 'meta', 'source', 'property', 'executor', 'propertyAddress', 'propertyAddressMeta']
const RELATIONS = ['status', 'client', 'contact', 'operator', 'assignee', 'classifier', 'organization', 'source', 'property', 'executor', 'related', 'placeClassifier', 'categoryClassifier', 'problemClassifier', 'classifierRule']
const DISCONNECT_ON_NULL = ['problemClassifier', 'executor']
export interface ITicketUIState extends Ticket {
    id: string
    organization: Organization
}

function convertToUIState (item: Ticket): ITicketUIState {
    if (item.dv !== 1) throw new Error('unsupported item.dv')
    return pick(item, FIELDS) as ITicketUIState
}

export interface ITicketFormState {
    id?: undefined
    organization?: string
    status?: string
    source?: string
    classifier?: string
    placeClassifier?: string
    categoryClassifier?: string
    problemClassifier?: string
    classifierRule?: string
    canReadByResident?: boolean
    assignee?: string
    operator?: string
    client?: string
    contact?: string
    clientPhone?: string
    clientName?: string
    deadline?: string
}

function convertToUIFormState (state: ITicketUIState): ITicketFormState | undefined {
    if (!state) return
    const result = {}
    const deadline = state['deadline']

    for (const attr of Object.keys(state)) {
        const attrId = get(state[attr], 'id')
        result[attr] = (RELATIONS.includes(attr) && state[attr]) ? attrId || state[attr] : state[attr]
    }

    result['deadline'] = deadline && dayjs(deadline)

    return result as ITicketFormState
}

function extractAttributes (state: ITicketUIState, attributes: Array<string>): ITicketFormState | undefined {
    if (!state) return
    const result = {}

    attributes.forEach((attribute) => {
        if (RELATIONS.includes(attribute)) {
            result[attribute] = get(state, [attribute, 'name'])
        } else {
            result[attribute] = get(state, attribute)
        }
    })

    return result as ITicketFormState
}


function convertToGQLInput (state: ITicketFormState): TicketUpdateInput {
    const sender = getClientSideSenderInfo()
    const result = { dv: 1, sender }
    for (const attr of Object.keys(state)) {
        const attrId = get(state[attr], 'id')
        result[attr] = (RELATIONS.includes(attr) && state[attr]) ? { connect: { id: (attrId || state[attr]) } } : state[attr]
        // TODO(zuch): need better logic here (contact can be ocasionally deleted from ticket)
        if (RELATIONS.includes(attr) && !state[attr] && !attrId && DISCONNECT_ON_NULL.includes(attr)) {
            result[attr] = { disconnectAll: true }
        }
    }
    return result
}

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useDelete,
} = generateReactHooks<Ticket, TicketUpdateInput, ITicketFormState, ITicketUIState, QueryAllTicketsArgs>(TicketGQL, { convertToGQLInput, convertToUIState })

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useDelete,
    convertToUIFormState,
    extractAttributes,
    convertToGQLInput,
}