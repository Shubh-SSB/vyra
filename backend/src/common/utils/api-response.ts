import { ApiResponse } from '../interfaces/api-response.interface';

export class ApiResponseUtil {
    static success<T>(
        data: T,
        message = 'Success',
        statusCode = 200,
    ): ApiResponse<T> {
        return {
            success: true,
            statusCode,
            message,
            data,
        };
    }

    static error(
        message = 'Something went wrong',
        statusCode = 500,
        errors?: unknown,
    ): ApiResponse<null> {
        return {
            success: false,
            statusCode,
            message,
            errors,
        };
    }
}