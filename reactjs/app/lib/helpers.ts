/**
 *
 * @param errors
 * @param setError
 */
export function setServerValidationErrors(errors: {}, setError: any): void {
    let shouldFocus = false;

    for (let field in errors) {
        setError(field, {
            type: 'Server Error',
            message: (errors as any)[field][0]
        }, {
            //focus on first error
            shouldFocus: shouldFocus ? false : shouldFocus = true
        })
    }
}