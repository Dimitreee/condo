import React from 'react'
import Icon from '@ant-design/icons'

interface BarEmployeeIconProps {
    viewBox?: string
}

const BarEmployeeIconSVG: React.FC<BarEmployeeIconProps> = ({ viewBox = '0 0 21 21' }) => {
    return (
        <svg width='23' height='23' viewBox={viewBox} fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.333 5.9a4.83 4.83 0 0 0-.843-2.722 4.979 4.979 0 0 0-2.244-1.805 5.094 5.094 0 0 0-2.888-.279c-.97.19-1.861.656-2.56 1.341a4.87 4.87 0 0 0-1.369 2.51 4.81 4.81 0 0 0 .285 2.83 4.923 4.923 0 0 0 1.841 2.2 5.072 5.072 0 0 0 6.312-.612A4.857 4.857 0 0 0 15.333 5.9Zm-8.416 0c0-.662.2-1.31.576-1.86.375-.55.909-.98 1.533-1.233A3.48 3.48 0 0 1 11 2.617c.663.129 1.271.448 1.75.916.477.468.802 1.065.934 1.714.132.65.064 1.323-.195 1.935a3.363 3.363 0 0 1-1.258 1.502 3.466 3.466 0 0 1-4.312-.418C7.279 7.64 6.918 6.788 6.917 5.9ZM1 20.01c0 .157.063.307.176.418a.606.606 0 0 0 .85 0 .586.586 0 0 0 .175-.418c.003-1.609.555-2.19 1.568-3.454 1.013-1.264 3.26-2.157 4.85-2.537l.213.412-1.788 2.912a.58.58 0 0 0 .131.497l2.7 2.953a.603.603 0 0 0 .458.207.613.613 0 0 0 .458-.207l2.7-2.953a.587.587 0 0 0 .132-.497l-1.789-2.912.211-.408c1.593.374 3.844 1.265 4.858 2.53 1.014 1.264 1.564 1.847 1.562 3.457a.586.586 0 0 0 .18.412.606.606 0 0 0 .842 0 .586.586 0 0 0 .18-.412c.003-1.963-.698-2.883-1.98-4.388-1.282-1.504-4.896-2.516-6.861-2.857a.659.659 0 0 0-.64.314l.483.998a.583.583 0 0 0-.054.384l1.772 2.833-2.054 2.204-2.054-2.204 1.772-2.833c.103-.301.53-1.115.43-1.382a.645.645 0 0 0-.638-.314c-1.965.342-5.579 1.354-6.86 2.858C1.7 17.127.998 18.048 1 20.01Z" fill="currentColor" stroke="#82879F"/></svg>
    )
}

export const BarEmployeeIcon: React.FC = (props) => {
    return (
        <Icon component={BarEmployeeIconSVG} {...props}/>
    )
}
