export default function is_array_repetetive<T>(input_array: T[]) {
    const first_elem = input_array[0]
    
    for (const elem of input_array) {
        if (elem !== first_elem) return false
    }

    return true
}