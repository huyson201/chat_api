
const createResponse = <T>(message: string, success: boolean = true, data: T | null = null, error: any | null = null) => {
    return {
        "success": success,
        "message": message,
        "data": data,
        "error": error
    }
}

export default createResponse