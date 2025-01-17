/**
 * Generated by `createschema resident.Resident 'user:Relationship:User:CASCADE; organization:Relationship:Organization:PROTECT; property:Relationship:Property:PROTECT; billingAccount?:Relationship:BillingAccount:SET_NULL; unitName:Text;'`
 */

import { pick, get } from 'lodash'

import { getClientSideSenderInfo } from '@condo/domains/common/utils/userid.utils'
import { generateReactHooks } from '@condo/domains/common/utils/codegeneration/generate.hooks'

import { Resident as ResidentGQL } from '@condo/domains/resident/gql'
import { Resident, ResidentUpdateInput, QueryAllResidentsArgs } from '@app/condo/schema'

const FIELDS = ['id', 'deletedAt', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy', 'user', 'organization', 'property', 'billingAccount', 'unitName', 'unitType']
const RELATIONS = ['user', 'organization', 'property', 'billingAccount']

export interface IResidentUIState extends Resident {
    id: string
    // TODO(codegen): write IResidentUIState or extends it from
}

function convertToUIState (item: Resident): IResidentUIState {
    if (item.dv !== 1) throw new Error('unsupported item.dv')
    return pick(item, FIELDS) as IResidentUIState
}

export interface IResidentFormState {
    id?: undefined
    // TODO(codegen): write IResidentUIFormState or extends it from
}

function convertToUIFormState (state: IResidentUIState): IResidentFormState | undefined {
    if (!state) return
    const result = {}
    for (const attr of Object.keys(state)) {
        const attrId = get(state[attr], 'id')
        result[attr] = (RELATIONS.includes(attr) && state[attr]) ? attrId || state[attr] : state[attr]
    }
    return result as IResidentFormState
}

function convertToGQLInput (state: IResidentFormState): ResidentUpdateInput {
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
} = generateReactHooks<Resident, ResidentUpdateInput, IResidentFormState, IResidentUIState, QueryAllResidentsArgs>(ResidentGQL, { convertToGQLInput, convertToUIState })

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useDelete,
    convertToUIFormState,
}
