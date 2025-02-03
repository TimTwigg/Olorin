import * as React from "react";

type DebouncedInputProps = {
    value: string | number
    onChange: (value: string | number) => void
    debounce?: number
};

// Taken from https://tanstack.com/table/latest/docs/framework/react/examples/filters
export const DebouncedInput = ({
    value: initialValue,
    onChange,
    debounce = 500,
    ...props
}: DebouncedInputProps & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) => {
    const [value, setValue] = React.useState(initialValue)

    React.useEffect(() => {
        setValue(initialValue)
    }, [initialValue])

    React.useEffect(() => {
        const timeout = setTimeout(() => {
            onChange(value)
        }, debounce)

        return () => clearTimeout(timeout)
    }, [value])

    return (
        <input {...props} value={value} onChange={e => setValue(e.target.value)} />
    )
}