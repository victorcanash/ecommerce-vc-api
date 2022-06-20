import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import BaseException from 'App/Exceptions/BaseException'

/*
|--------------------------------------------------------------------------
| Exception
|--------------------------------------------------------------------------
|
| The Exception class imported from `@adonisjs/core` allows defining
| a status code and error code for every exception.
|
| @example
| new AuthenticationException('message', 500, 'E_RUNTIME_EXCEPTION')
|
*/
export default class AuthenticationException extends BaseException {
  public async handle(error, ctx: HttpContextContract) {
    this.errorResponse = {
      code: 401,
      error: 'Authentication error',
      message: error.message,
    }
    return super.handle(error, ctx)
  }

  public report() {
    super.report()
  }
}