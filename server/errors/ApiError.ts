export class ApiError {
  static BadRequest(message: string, data?: object) {
    return createError({ message, statusCode: 400, data })
  }
  static UnauthorizedError(data?: object) {
    return createError({ message: 'Unauthorized', statusCode: 401, data })
  }
  static ServerError(message: string, data?: object) {
    return createError({ message, statusCode: 500, data })
  }
}
