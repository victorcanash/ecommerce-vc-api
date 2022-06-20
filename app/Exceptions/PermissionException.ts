import { Exception } from '@adonisjs/core/build/standalone'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import { BasicErrorResponse } from 'App/Exceptions/types'

/*
|--------------------------------------------------------------------------
| Exception
|--------------------------------------------------------------------------
|
| The Exception class imported from `@adonisjs/core` allows defining
| a status code and error code for every exception.
|
| @example
| new PermissionException('message', 500, 'E_RUNTIME_EXCEPTION')
|
*/
export default class PermissionException extends Exception {
  public async handle(error, { response }: HttpContextContract) {
    return response.forbidden({
      code: 403,
      error: 'Permissions error',
      message: error.message,
    } as BasicErrorResponse)
  }

  // public report(error: this, ctx: HttpContextContract) {}
}
