import React from 'react'
import Icon from '@ant-design/icons'

interface EmployeeIconProps {
    viewBox?: string
}

const EmployeeIconSVG: React.FC<EmployeeIconProps> = ({ viewBox = '0 0 22 22' }) => {
    return (
        <svg width='24' height='24' viewBox={viewBox} fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.834 11a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0-8.333a3.333 3.333 0 1 1 0 6.666 3.333 3.333 0 0 1 0-6.666ZM9.833 13c-2.12.002-4.987.761-6.487 2.11-1.5 1.35-2.344 3.18-2.346 5.09 0 .212.094.416.26.566.167.15.393.234.629.234a.942.942 0 0 0 .628-.235.762.762 0 0 0 .26-.565c0-1.485.656-2.91 1.823-3.96 1.167-1.05 3.583-1.64 5.233-1.64 1.65 0 4.067.59 5.234 1.64 1.167 1.05 1.822 2.475 1.822 3.96 0 .212.094.416.26.566.167.15.393.234.629.234a.942.942 0 0 0 .629-.235.762.762 0 0 0 .26-.565c-.002-1.91-.846-3.74-2.346-5.09-1.5-1.349-4.367-2.108-6.488-2.11Z" fill="currentColor" stroke="#82879F"/></svg>
    )
}

export const BarUserIcon: React.FC = (props) => {
    return (
        <Icon component={EmployeeIconSVG} {...props}/>
    )
}
