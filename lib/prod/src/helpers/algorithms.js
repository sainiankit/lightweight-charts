/**
 * Binary function that accepts two arguments (the first of the type of array elements, and the second is always val), and returns a value convertible to bool.
 * The value returned indicates whether the first argument is considered to go before the second.
 * The function shall not modify any of its arguments.
 */
export function lowerbound(arr, value, compare, start = 0, to = arr.length) {
    let count = to - start;
    while (0 < count) {
        const count2 = (count >> 1);
        const mid = start + count2;
        if (compare(arr[mid], value)) {
            start = mid + 1;
            count -= count2 + 1;
        }
        else {
            count = count2;
        }
    }
    return start;
}
export function upperbound(arr, value, compare, start = 0, to = arr.length) {
    let count = to - start;
    while (0 < count) {
        const count2 = (count >> 1);
        const mid = start + count2;
        if (!(compare(value, arr[mid]))) {
            start = mid + 1;
            count -= count2 + 1;
        }
        else {
            count = count2;
        }
    }
    return start;
}
