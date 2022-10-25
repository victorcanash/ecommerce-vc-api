import User from 'App/Models/User'
import CartItem from 'App/Models/CartItem'
import Product from 'App/Models/Product'
import ProductCategory from 'App/Models/ProductCategory'
import ProductDiscount from 'App/Models/ProductDiscount'
import ProductInventory from 'App/Models/ProductInventory'

/**
 * Basic JSON response for Controllers
 */
export type BasicResponse = {
  code: number
  message: string
}

/**
 * Auth JSON response for Controllers
 */
export type AuthResponse = {
  code: number
  message: string
  token: string
  user: User
}

/**
 * Check admin role JSON response for Controllers
 */
export type IsAdminResponse = {
  code: number
  message: string
  isAdmin: boolean
}

/**
 * User JSON response for Controllers
 */
export type UserResponse = {
  code: number
  message: string
  user: User
}

/**
 * Users JSON response for Controllers
 */
export type UsersResponse = {
  code: number
  message: string
  users: User[]
  totalPages: number
  currentPage: number
}

/**
 * User address JSON response for Controllers
 */
/*export type UAddressResponse = {
  code: number
  message: string
  userAddress: UserAddress
}*/

/**
 * User addresses JSON response for Controllers
 */
/*export type UAddressesResponse = {
  code: number
  message: string
  userAddresses: UserAddress[]
  totalPages: number
  currentPage: number
}*/

/**
 * User payment JSON response for Controllers
 */
/*export type UPaymentResponse = {
  code: number
  message: string
  userPayment: UserPayment
}*/

/**
 * User payments JSON response for Controllers
 */
/*export type UPaymentsResponse = {
  code: number
  message: string
  userPayments: UserPayment[]
  totalPages: number
  currentPage: number
}*/

/**
 * Cart item JSON response for Controllers
 */
export type CItemResponse = {
  code: number
  message: string
  cartItem: CartItem
}

/**
 * Product JSON response for Controllers
 */
export type ProductResponse = {
  code: number
  message: string
  product: Product
}

/**
 * Products JSON response for Controllers
 */
export type ProductsResponse = {
  code: number
  message: string
  products: Product[]
  category: ProductCategory | null
  totalPages: number
  currentPage: number
}

/**
 * Product images JSON response for Controllers
 */
export type PImagesResponse = {
  code: number
  message: string
  productImages: string[]
}

/**
 * Product category JSON response for Controllers
 */
export type PCategoryResponse = {
  code: number
  message: string
  productCategory: ProductCategory
}

/**
 * Product categories JSON response for Controllers
 */
export type PCategoriesResponse = {
  code: number
  message: string
  productCategories: ProductCategory[]
  totalPages: number
  currentPage: number
}

/**
 * Product discount JSON response for Controllers
 */
export type PDiscountResponse = {
  code: number
  message: string
  productDiscount: ProductDiscount
}

/**
 * Product inventory JSON response for Controllers
 */
export type PInventoryResponse = {
  code: number
  message: string
  productInventory: ProductInventory
}

/**
 * Paypal checkout order JSON response for Controllers
 */
export type PaypalCheckoutOrderResponse = {
  code: number
  message: string
  checkoutUrl: string
}

/**
 * Paypal capture order JSON response for Controllers
 */
export type PaypalCaptureOrderResponse = {
  code: number
  message: string
  paypalOrder: any
}

/**
 * Stripe JSON response for Controllers
 */
/*export type StripeResponse = {
  code: number
  message: string
  sessionId: string
}*/
