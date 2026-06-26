class HttpError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number, options?: ErrorOptions) {
    super(message, options);
    this.statusCode = statusCode;
  }
}

export { HttpError };
