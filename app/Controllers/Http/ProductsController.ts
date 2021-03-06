import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Product from 'App/Models/Product'
import { ProductsResponse, ProductResponse, BasicResponse } from 'App/Controllers/Http/types'
import PaginationValidator from 'App/Validators/List/PaginationValidator'
import SortValidator from 'App/Validators/List/SortValidator'
import FilterProductValidator from 'App/Validators/Product/FilterProductValidator'
import CreateProductValidator from 'App/Validators/Product/CreateProductValidator'
import UpdateProductValidator from 'App/Validators/Product/UpdateProductValidator'
import ModelNotFoundException from 'App/Exceptions/ModelNotFoundException'
import { logRouteSuccess } from 'App/Utils/logger'

export default class ProductsController {
  public async index({ request, response }: HttpContextContract) {
    const validatedPaginationData = await request.validate(PaginationValidator)
    const page = validatedPaginationData.page || 1
    const limit = validatedPaginationData.limit || 10

    const validatedSortData = await request.validate(SortValidator)
    const sortBy = validatedSortData.sort_by || 'id'
    const order = validatedSortData.order || 'asc'

    const validatedFilterData = await request.validate(FilterProductValidator)
    const keywords = validatedFilterData.keywords || ''
    const categoryId = validatedFilterData.category_id || -1
    const ordersRemain = validatedFilterData.orders_remain || false

    const products = await Product.query()
      .where((query) => {
        query
          .where('name', 'ILIKE', `%${keywords}%`)
          .orWhere('description', 'ILIKE', `%${keywords}%`)
          .orWhereHas('category', (query) => {
            query
              .where('name', 'ILIKE', `%${keywords}%`)
              .orWhere('description', 'ILIKE', `%${keywords}%`)
          })
      })
      .whereHas('inventories', (query) => {
        if (ordersRemain) {
          query.where('quantity', '>', 0)
        }
      })
      .whereHas('category', (query) => {
        if (categoryId >= 0) {
          query.where('id', categoryId)
        }
      })
      .preload('discount')
      .preload('inventories')
      /*.preload('inventories', (query) => {
        query.where('quantity', '>', 0)
      })*/
      .orderBy(sortBy, order)
      .paginate(page, limit)
    const result = products.toJSON()

    const successMsg = 'Successfully got products'
    logRouteSuccess(request, successMsg)
    return response.ok({
      code: 200,
      message: successMsg,
      products: result.data,
      totalPages: Math.ceil(result.meta.total / limit),
      currentPage: result.meta.current_page as number,
    } as ProductsResponse)
  }

  public async show({ params: { id }, request, response }: HttpContextContract) {
    const product = await Product.find(id)
    if (!product) {
      throw new ModelNotFoundException(`Invalid id ${id} getting product`)
    }

    const successMsg = `Successfully got product by id ${id}`
    logRouteSuccess(request, successMsg)
    return response.ok({
      code: 200,
      message: successMsg,
      product: product,
    } as ProductResponse)
  }

  public async store({ request, response }: HttpContextContract) {
    const validatedData = await request.validate(CreateProductValidator)

    const product = await Product.create(validatedData)

    const successMsg = 'Successfully created product'
    logRouteSuccess(request, successMsg)
    return response.created({
      code: 201,
      message: successMsg,
      product: product,
    } as ProductResponse)
  }

  public async update({ params: { id }, request, response }: HttpContextContract) {
    const product = await Product.find(id)
    if (!product) {
      throw new ModelNotFoundException(`Invalid id ${id} updating product`)
    }

    const validatedData = await request.validate(UpdateProductValidator)

    product.merge(validatedData)
    await product.save()

    const successMsg = `Successfully updated product by id ${id}`
    logRouteSuccess(request, successMsg)
    return response.created({
      code: 201,
      message: successMsg,
      product: product,
    } as ProductResponse)
  }

  public async destroy({ params: { id }, request, response }: HttpContextContract) {
    const product = await Product.find(id)
    if (!product) {
      throw new ModelNotFoundException(`Invalid id ${id} deleting product`)
    }

    await product.delete()

    const successMsg = `Successfully deleted product by id ${id}`
    logRouteSuccess(request, successMsg)
    return response.ok({
      code: 200,
      message: successMsg,
    } as BasicResponse)
  }
}
