import React from 'react'
import Label from './Label';

interface InfoFieldProps {
    label: string,
    value: string | number,
    withLabel?: boolean;
}

const InfoField: React.FC<InfoFieldProps> = ({ label, value, withLabel = true, }) => {
    return (
        <div className='w-full'>
            {withLabel && (
                <Label label={label} />
            )}
            <p className='text-text-light'>
                {value}
            </p>
        </div>
    )
}

export default InfoField