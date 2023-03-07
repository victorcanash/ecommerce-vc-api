export type OrderBigbuy = {
  id: string
  status: string
  shippingAddress: {
    firstName: string
    lastName: string
    country: string
    postcode: string
    town: string
    address: string
    phone: string
    email: string
    companyName: string
  }
  products: OrderBigbuyProduct[]
}

export type OrderBigbuyProduct = {
  id?: string
  reference: string
  quantity: number
  name?: string
  internalReference: string
}

export type OrderTransaction = {
  amount: string
  billing: {
    firstName: string
    lastName: string
    country: string
    postalCode: string
    locality: string
    addressLine1: string
    addressLine2: string
  }
  creditCard: {
    cardType: string
    last4: string
  }
  paypalAccount: {
    payerEmail: string
  }
}

export type OrderPaypalProduct = {
  name: string
  description: string
  category: 'PHYSICAL_GOODS'
  sku: string
  quantity: string
  unit_amount: {
    currency_code: string
    value: string
  }
}
