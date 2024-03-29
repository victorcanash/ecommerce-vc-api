import Mail from '@ioc:Adonis/Addons/Mail'
import Env from '@ioc:Adonis/Core/Env'
import { I18nContract } from '@ioc:Adonis/Addons/I18n'
import Drive from '@ioc:Adonis/Core/Drive'

import { ContactTypes } from 'App/Constants/contact'
import User from 'App/Models/User'
import Order from 'App/Models/Order'
import Cart from 'App/Models/Cart'
import { CheckoutData } from 'App/Types/checkout'
import { GuestCartCheck } from 'App/Types/cart'
import RegisterWelcomeEmail from 'App/Mailers/RegisterWelcomeEmail'
import OrderBreakdownEmail from 'App/Mailers/OrderBreakdownEmail'
import OrderIssuedEmail from 'App/Mailers/OrderIssuedEmail'
import OrderReviewEmail from 'App/Mailers/OrderReviewEmail'
import { logSuccess } from 'App/Utils/logger'

export default class MailService {
  public static async sendRegisterWelcomeEmail(
    i18n: I18nContract,
    email: string,
    firstName: string
  ) {
    await new RegisterWelcomeEmail(i18n, email, firstName).sendLater()
  }

  public static async sendActivationEmail(
    user: User,
    i18n: I18nContract,
    appName: string,
    appDomain: string,
    btnUrl: string
  ) {
    const currentYear = new Date().getFullYear()
    await Mail.send((message) => {
      message
        .from(Env.get('SMTP_EMAIL'))
        .to(user.email)
        .subject(i18n.formatMessage('messages.emails.auth.activation.subject'))
        .htmlView('emails/auth', {
          i18n,
          appName,
          appDomain,
          currentYear,
          username: user.firstName,
          description: i18n.formatMessage('messages.emails.auth.activation.description'),
          btnTxt: i18n.formatMessage('messages.emails.auth.activation.button'),
          btnUrl,
        })
    })
    logSuccess('Sent activation email')
  }

  public static async sendResetPswEmail(
    user: User,
    i18n: I18nContract,
    appName: string,
    appDomain: string,
    btnUrl: string
  ) {
    const currentYear = new Date().getFullYear()
    await Mail.send((message) => {
      message
        .from(Env.get('SMTP_EMAIL'))
        .to(user.email)
        .subject(i18n.formatMessage('messages.emails.auth.resetPsw.subject'))
        .htmlView('emails/auth', {
          i18n,
          appName,
          appDomain,
          currentYear,
          username: user.firstName,
          description: i18n.formatMessage('messages.emails.auth.resetPsw.description'),
          btnTxt: i18n.formatMessage('messages.emails.auth.resetPsw.button'),
          btnUrl,
        })
    })
    logSuccess('Sent reset psw email')
  }

  public static async sendUpdateEmail(
    user: User,
    i18n: I18nContract,
    appName: string,
    appDomain: string,
    btnUrl: string,
    email: string,
    revert = false
  ) {
    const currentYear = new Date().getFullYear()
    const subject = revert
      ? i18n.formatMessage('messages.emails.auth.revertEmail.subject')
      : i18n.formatMessage('messages.emails.auth.updateEmail.subject')
    const description = revert
      ? i18n.formatMessage('messages.emails.auth.revertEmail.description')
      : i18n.formatMessage('messages.emails.auth.updateEmail.description')
    const btnTxt = revert
      ? i18n.formatMessage('messages.emails.auth.revertEmail.button')
      : i18n.formatMessage('messages.emails.auth.updateEmail.button')
    await Mail.send((message) => {
      message.from(Env.get('SMTP_EMAIL')).to(email).subject(subject).htmlView('emails/auth', {
        i18n,
        appName,
        appDomain,
        currentYear,
        username: user.firstName,
        description,
        btnTxt,
        btnUrl,
      })
    })
    logSuccess('Sent update email')
  }

  public static async sendContactEmail(
    i18n: I18nContract,
    appName: string,
    appDomain: string,
    userContact: {
      type: ContactTypes
      email: string
      firstName: string
      orderBigbuyId: string | undefined
      comments: string
    },
    images: string[]
  ) {
    const currentYear = new Date().getFullYear()
    await Mail.send(async (message) => {
      message
        .from(Env.get('SMTP_EMAIL'))
        .to(Env.get('SMTP_EMAIL'))
        .subject('User Contact')
        .htmlView('emails/contact', {
          locale: i18n.locale,
          appName,
          appDomain,
          currentYear,
          userContact,
        })
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const imgContent = await Drive.get(images[i])
          message.attachData(imgContent, {
            filename: images[i],
          })
        }
      }
    })
    logSuccess('Sent contact email')
  }

  public static async sendOrderBreakdownEmail(
    i18n: I18nContract,
    email: string,
    firstName: string,
    order: Order,
    currency: string
  ) {
    await new OrderBreakdownEmail(
      i18n,
      email,
      firstName,
      order,
      currency === 'EUR' ? '€' : '$'
    ).sendLater()
  }

  public static async sendOrderIssuedEmail(
    i18n: I18nContract,
    email: string,
    firstName: string,
    order: Order
  ) {
    await new OrderIssuedEmail(i18n, email, firstName, order).sendLater()
  }

  public static async sendOrderReviewEmail(
    i18n: I18nContract,
    email: string,
    firstName: string,
    order: Order
  ) {
    await new OrderReviewEmail(i18n, email, firstName, order).sendLater()
  }

  public static async sendErrorCreateOrderEmail(
    i18n: I18nContract,
    errorMsg: string,
    checkoutData: CheckoutData,
    paypalTransactionId: string | undefined,
    cart: Cart | GuestCartCheck,
    currency: string
  ) {
    const currentYear = new Date().getFullYear()
    const currentDate = new Date().toLocaleDateString()
    await Mail.send((message) => {
      message
        .from(Env.get('SMTP_EMAIL'))
        .to(Env.get('SMTP_EMAIL'))
        .subject('Error creating new order')
        .htmlView('emails/orders/error-create-order', {
          locale: i18n.locale,
          currentYear,
          currentDate,
          errorMsg,
          checkoutData,
          paypalTransactionId,
          cart,
          currency,
        })
    })
    logSuccess('Sent error create order email')
  }

  public static async sendErrorGetOrderEmail(
    i18n: I18nContract,
    errorMsg: string,
    order: Order,
    currency: string
  ) {
    const currentYear = new Date().getFullYear()
    const currentDate = new Date().toLocaleDateString()
    await Mail.send((message) => {
      message
        .from(Env.get('SMTP_EMAIL'))
        .to(Env.get('SMTP_EMAIL'))
        .subject('Error sending new order email')
        .htmlView('emails/orders/error-get-order-email', {
          locale: i18n.locale,
          currentYear,
          currentDate,
          errorMsg,
          order,
          currency,
        })
    })
    logSuccess('Sent error get order email')
  }
}
