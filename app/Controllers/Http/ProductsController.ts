import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

//import { defaultPage, defaultLimit, defaultOrder, defaultSortBy } from 'App/Constants/lists'
import Product from 'App/Models/Product'
import ProductsService from 'App/Services/ProductsService'
//import UsersService from 'App/Services/UsersService'
import { /*ProductsResponse,*/ ProductResponse, BasicResponse } from 'App/Controllers/Http/types'
//import PaginationValidator from 'App/Validators/List/PaginationValidator'
//import SortValidator from 'App/Validators/List/SortValidator'
//import FilterProductValidator from 'App/Validators/Product/FilterProductValidator'
import CreateProductValidator from 'App/Validators/Product/CreateProductValidator'
import UpdateProductValidator from 'App/Validators/Product/UpdateProductValidator'
//import PermissionException from 'App/Exceptions/PermissionException'
import { logRouteSuccess } from 'App/Utils/logger'

export default class ProductsController {
  /*public async index({ request, response, auth }: HttpContextContract) {
    const validatedPaginationData = await request.validate(PaginationValidator)
    const page = validatedPaginationData.page || defaultPage
    const limit = validatedPaginationData.limit || defaultLimit

    const validatedSortData = await request.validate(SortValidator)
    const sortBy = validatedSortData.sortBy || defaultSortBy
    const order = validatedSortData.order || defaultOrder

    const validatedFilterData = await request.validate(FilterProductValidator)
    const keywords = validatedFilterData.keywords || ''
    const adminData = validatedFilterData.adminData || false

    const validApiToken = await auth.use('api').check()
    const isAuthAdmin = !validApiToken ? false : await UsersService.isAuthAdmin(auth)
    if (adminData && !isAuthAdmin) {
      throw new PermissionException('You need to be an admin to get admin data')
    }

    const products = await Product.query()
      .apply((scopes) => {
        scopes.filter(keywords)
        scopes.getInventoriesData()
        if (adminData) {
          scopes.getAdminData()
        }
      })
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

  public async show({ params: { id }, request, response, auth }: HttpContextContract) {
    const validatedFilterData = await request.validate(FilterProductValidator)
    const adminData = validatedFilterData.adminData || false
    const bigbuyData = validatedFilterData.adminData || false

    if (!UsersService.isAuthAdmin(auth)) {
      if (adminData) {
        throw new PermissionException('You need to be an admin to get admin data')
      }
      if (bigbuyData) {
        throw new PermissionException('You need to be an admin to get bigbuy data')
      }
    }

    const product = await ProductsService.getProductByIdWithInventories(id, adminData, bigbuyData)

    const successMsg = `Successfully got product by id ${id}`
    logRouteSuccess(request, successMsg)
    return response.ok({
      code: 200,
      message: successMsg,
      product: product,
    } as ProductResponse)
  }*/

  public async store({ request, response }: HttpContextContract) {
    const validatedData = await request.validate(CreateProductValidator)
    const { categoriesIds, ...createProductData } = validatedData

    const textsData = await ProductsService.createLocalizedTexts(
      validatedData.name,
      validatedData.description
    )
    const product = await Product.create({
      ...createProductData,
      ...textsData,
    })
    await product.related('categories').attach(validatedData.categoriesIds)
    await product.save()

    const successMsg = 'Successfully created product'
    logRouteSuccess(request, successMsg)
    return response.created({
      code: 201,
      message: successMsg,
      product: product,
    } as ProductResponse)
  }

  public async update({ params: { id }, request, response }: HttpContextContract) {
    const product = await ProductsService.getProductById(id)

    const validatedData = await request.validate(UpdateProductValidator)
    const { categoriesIds, ...updateProductData } = validatedData

    await ProductsService.updateLocalizedTexts(
      product,
      validatedData.name,
      validatedData.description
    )
    product.merge(updateProductData)
    await product.related('categories').detach()
    if (validatedData.categoriesIds && validatedData.categoriesIds?.length > 0) {
      await product.related('categories').attach(validatedData.categoriesIds)
    }
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
    const product = await ProductsService.getProductById(id)

    await product.delete()

    const successMsg = `Successfully deleted product by id ${id}`
    logRouteSuccess(request, successMsg)
    return response.ok({
      code: 200,
      message: successMsg,
    } as BasicResponse)
  }
}
