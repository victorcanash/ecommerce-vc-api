import { schema, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import { CustomReporter } from 'App/Validators/Reporters/CustomReporter'
import { guestUserSchema, guestCartSchema } from 'App/Validators/shared'

export default class CreateTransactionValidator {
  constructor(protected ctx: HttpContextContract) {}

  public reporter = CustomReporter

  public schema = schema.create({
    appName: schema.string(),
    appDomain: schema.string(),
    guestUser: guestUserSchema,
    guestCart: guestCartSchema,
    paymentMethodNonce: schema.string.optional(),
    remember: schema.boolean.optional(),
    cardName: schema.string.optional(),
  })

  public messages: CustomMessages = {}
}
