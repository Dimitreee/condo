import { ApolloCache } from '@apollo/client/cache'
import get from 'lodash/get'
import { generateQueryVariables } from '@condo/domains/common/components/TicketCard/TicketCardList'
import { Ticket as TicketGQL } from '@condo/domains/ticket/gql'
import { ITicketUIState } from '@condo/domains/ticket/utils/clientSchema/Ticket'

interface ICachedData {
    objs: ITicketUIState[],
}

type TicketCacheUtilsHook = (cache: ApolloCache<unknown>) => {
    addTicketToQueryCacheForTicketCardList: (ticket: ITicketUIState) => void
}

export const useCacheUtils: TicketCacheUtilsHook = (cache) => {
    function addTicketToQueryCacheForTicketCardList (ticket) {
        const ticketContactId = get(ticket, ['contact', 'id'], null)
        const queryData = {
            query: TicketGQL.GET_ALL_OBJS_WITH_COUNT_QUERY,
            variables: generateQueryVariables(ticketContactId),
        }

        const cachedData: ICachedData = cache.readQuery(queryData)

        if (cachedData) {
            cache.writeQuery({
                ...queryData,
                data: {
                    ...cachedData,
                    objs: [...cachedData.objs, ticket],
                },
            })
        }
    }

    return { addTicketToQueryCacheForTicketCardList }
}