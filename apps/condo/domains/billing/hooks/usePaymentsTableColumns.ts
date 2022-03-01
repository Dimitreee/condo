import { getFilterIcon, getTextFilterDropdown } from '@condo/domains/common/components/Table/Filters'
import { getDateRender, getMoneyRender, getTextRender } from '@condo/domains/common/components/Table/Renders'
import { getSorterMap, parseQuery } from '@condo/domains/common/utils/tables.utils'
import { useIntl } from '@core/next/intl'
import { get } from 'lodash'
import { useRouter } from 'next/router'
import { useMemo } from 'react'

export const usePaymentsTableColumns = (currencyCode: string) => {
    const intl = useIntl()
    const router = useRouter()

    const addressTitle = intl.formatMessage({ id: 'field.Address' })
    const dateTitle = intl.formatMessage({ id: 'Date' })
    const accountTitle = intl.formatMessage({ id: 'field.AccountNumberShort' })
    const unitNameTitle = intl.formatMessage({ id: 'field.FlatNumber' })
    const typeTitle = intl.formatMessage({ id: 'PaymentType' })
    const transactionTitle = intl.formatMessage({ id: 'Transaction' })
    const paymentAmountTitle = intl.formatMessage({ id: 'PaymentAmount' })

    const { filters, sorters } = parseQuery(router.query)
    const sorterMap = getSorterMap(sorters)

    return useMemo(() => {
        let search = get(filters, 'search')
        search = Array.isArray(search) ? null : search

        const columns = {
            date: {
                title: dateTitle,
                key: 'advancedAt',
                dataIndex: ['advancedAt'],
                sorter: true,
                width: '15%',
                render: getDateRender(intl, String(search)),
            },
            account: {
                title: accountTitle,
                key: 'accountNumber',
                dataIndex: 'accountNumber',
                render: getTextRender(String(search)),
            },
            address: {
                title: addressTitle,
                key: 'address',
                dataIndex: ['frozenReceipt', 'data', 'property', 'address'],
                sorter: false,
                filteredValue: get(filters, 'address'),
                width: '50%',
                filterIcon: getFilterIcon,
                filterDropdown: getTextFilterDropdown(addressTitle),
                render: getTextRender(search),
            },
            unitName: {
                title: unitNameTitle,
                key: 'unitName',
                dataIndex: ['frozenReceipt', 'data', 'account', 'unitName'],
            },
            type: {
                title: typeTitle,
                key: 'type',
                dataIndex: ['context', 'integration', 'name'],
            },
            transaction: {
                title: transactionTitle,
                key: 'transaction',
                dataIndex: ['multiPayment', 'transactionId'],
            },
            amount: {
                title: paymentAmountTitle,
                key: 'amount',
                dataIndex: 'amount',
                render: getMoneyRender(String(search), intl, currencyCode),
            },
        }

        return Object.values(columns)
    }, [
        filters,
        sorterMap,
        currencyCode,
    ])
}