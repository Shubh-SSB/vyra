import { useDebounce as useDebouncePackage } from "use-debounce";

export const useDebounce = (value: string, delay: number) => {
    const [debouncedValue] = useDebouncePackage(value, delay);
    return debouncedValue;
}