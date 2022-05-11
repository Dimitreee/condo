/**
 * Generated by `createschema ticket.UserTicketCommentReadTime 'user:Relationship:User:CASCADE; ticket:Relationship:Ticket:CASCADE; readResidentCommentAt:DateTimeUtc;'`
 */

import { pick, get } from 'lodash'

import { UserTicketCommentReadTime, UserTicketCommentReadTimeUpdateInput, QueryAllUserTicketCommentReadTimesArgs } from '@app/condo/schema'

import { getClientSideSenderInfo } from '@condo/domains/common/utils/userid.utils'
import { generateReactHooks } from '@condo/domains/common/utils/codegeneration/generate.hooks'
import { UserTicketCommentReadTime as UserTicketCommentReadTimeGQL } from '@condo/domains/ticket/gql'
import { IUserUIState } from '@condo/domains/user/utils/clientSchema/User'

import { ITicketUIState } from './Ticket'

const FIELDS = ['id', 'deletedAt', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy', 'user', 'ticket', 'readCommentAt', 'readResidentCommentAt']
const RELATIONS = ['user', 'ticket']

export interface IUserTicketCommentReadTimeUIState extends UserTicketCommentReadTime {
    id: string
    user?: IUserUIState
    ticket?: ITicketUIState
    readResidentCommentAt?: string
    readCommentAt?: string
}

function convertToUIState (item: UserTicketCommentReadTime): IUserTicketCommentReadTimeUIState {
    if (item.dv !== 1) throw new Error('unsupported item.dv')
    return pick(item, FIELDS) as IUserTicketCommentReadTimeUIState
}

export interface IUserTicketCommentReadTimeFormState {
    id?: string
    user?: string
    ticket?: string
    readResidentCommentAt?: Date
    readCommentAt?: Date
}

function convertToUIFormState (state: IUserTicketCommentReadTimeUIState): IUserTicketCommentReadTimeFormState | undefined {
    if (!state) return
    const result = {}
    for (const attr of Object.keys(state)) {
        const attrId = get(state[attr], 'id')
        result[attr] = (RELATIONS.includes(attr) && state[attr]) ? attrId || state[attr] : state[attr]
    }
    return result as IUserTicketCommentReadTimeFormState
}

function convertToGQLInput (state: IUserTicketCommentReadTimeFormState): UserTicketCommentReadTimeUpdateInput {
    const sender = getClientSideSenderInfo()
    const result = { dv: 1, sender }
    for (const attr of Object.keys(state)) {
        const attrId = get(state[attr], 'id')
        result[attr] = (RELATIONS.includes(attr) && state[attr]) ? { connect: { id: (attrId || state[attr]) } } : state[attr]
    }
    return result
}

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useDelete,
} = generateReactHooks<UserTicketCommentReadTime, UserTicketCommentReadTimeUpdateInput, IUserTicketCommentReadTimeFormState, IUserTicketCommentReadTimeUIState, QueryAllUserTicketCommentReadTimesArgs>(UserTicketCommentReadTimeGQL, { convertToGQLInput, convertToUIState })

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useDelete,
    convertToUIFormState,
}