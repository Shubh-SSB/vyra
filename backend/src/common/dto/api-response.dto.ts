export class ApiResponseDto<T> {
  data: T;
  message: string;
  type: "success" | "error" | "warning" | "info";
  errors: string[];

  constructor(
    data: T,
    message: string,
    type: "success" | "error" | "warning" | "info" = "success",
    errors: string[] = [],
  ) {
    this.data = data;
    this.message = message;
    this.type = type;
    this.errors = errors;
  }
}