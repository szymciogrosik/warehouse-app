export class ErrorUtils {
  // Error codes
  public static UNHANDLED_ERROR = 'F_ERR_000';
  public static HTTP_UNAUTHORIZED = 'F_ERR_001';
  public static NOT_ENOUGH_RIGHTS = 'F_ERR_002';

  // Error messages
  private static messages: Map<string, string> = new Map([
    [ErrorUtils.UNHANDLED_ERROR, 'Unrecognized error'],
    [ErrorUtils.HTTP_UNAUTHORIZED, 'Authorization failed'],
    [ErrorUtils.NOT_ENOUGH_RIGHTS, 'You don\'t have enough rights to see this page']
  ]);

  public static getMessage(errorCode: string): string {
    const message = ErrorUtils.messages.get(errorCode);
    return message !== undefined
      ? ErrorUtils.buildMessage(errorCode, message)
      : ErrorUtils.buildMessage(ErrorUtils.UNHANDLED_ERROR, ErrorUtils.messages.get(ErrorUtils.UNHANDLED_ERROR)!);
  }

  private static buildMessage(errorCode: string, errorMessage: string): string {
    return 'Error code: ' + errorCode + ' - ' + errorMessage + '.';
  }
}
