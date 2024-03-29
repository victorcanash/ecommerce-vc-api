import NP from 'number-precision'

import { defaultLimit, defaultOrder, defaultPage, defaultSortBy } from 'App/Constants/lists'
import TextsBaseModel from 'App/Models/TextsBaseModel'
import Product from 'App/Models/Product'
import Landing from 'App/Models/Landing'
import ProductCategory from 'App/Models/ProductCategory'
import ProductCategoryGroup from 'App/Models/ProductCategoryGroup'
import ProductInventory from 'App/Models/ProductInventory'
import ProductDiscount from 'App/Models/ProductDiscount'
import ProductPack from 'App/Models/ProductPack'
import LocalizedText from 'App/Models/LocalizedText'
import ProductReview from 'App/Models/ProductReview'
import BigbuyService from 'App/Services/BigbuyService'
import ModelNotFoundException from 'App/Exceptions/ModelNotFoundException'

export default class ProductsService {
  public static async getProductById(id: number) {
    return this.getProductByField('id', id, false, false)
  }

  /*public static async getProductByIdWithInventories(
    id: number,
    adminData = false,
    bigbuyData?: boolean
  ) {
    return this.getProductByField('id', id, true, false, adminData, bigbuyData)
  }*/

  public static async getLandingById(id: number, productsData?: boolean) {
    return this.getLandingByField('id', id, productsData)
  }

  public static async getLandingBySlug(slug: string, productsData?: boolean) {
    return this.getLandingByField('slug', slug, productsData)
  }

  public static async getLandingsByCategory(
    category: ProductCategory | ProductCategoryGroup,
    page = defaultPage,
    limit = defaultLimit,
    sortBy = defaultSortBy,
    order = defaultOrder,
    adminData?: boolean
  ) {
    const categoryIds: number[] = []
    if ((category as ProductCategoryGroup)?.categories) {
      ;(category as ProductCategoryGroup).categories.forEach((category) => {
        categoryIds.push(category.id)
      })
    } else {
      categoryIds.push(category.id)
    }

    const landings = await Landing.query()
      .whereHas('products', (query) => {
        query.whereHas('categories', (query) => {
          query.whereIn('category_id', categoryIds)
        })
      })
      .orWhereHas('packs', (query) => {
        query.whereHas('inventories', (query) => {
          query.whereHas('product', (query) => {
            query.whereHas('categories', (query) => {
              query.whereIn('category_id', categoryIds)
            })
          })
        })
      })
      .apply((scopes) => {
        scopes.getProductsData(adminData)
      })
      .orderBy(sortBy, order)
      .paginate(page, limit)

    const result = landings.toJSON()
    return result
  }

  public static async getCategoryById(id: number) {
    return this.getCategoryByField('id', id)
  }

  public static async getCategoryGroupById(id: number) {
    return this.getCategoryGroupByField('id', id)
  }

  public static async getCategoryBySlug(slug: string) {
    return this.getSomeCategoryByField('slug', slug)
  }

  public static async getInventoryById(id: number) {
    return this.getInventoryByField('id', id)
  }

  public static async getDiscountById(id: number) {
    return this.getDiscountByField('id', id)
  }

  public static async getPackById(id: number) {
    return this.getPackByField('id', id)
  }

  public static async getReviewById(id: number, landingData?: boolean) {
    return this.getReviewByField('id', id, landingData)
  }

  public static async createLocalizedTexts(
    name: {
      en: string
      es: string
    },
    description: {
      en: string
      es: string
    }
  ) {
    const nameText = await LocalizedText.create(name)
    const descriptionText = await LocalizedText.create(description)
    return {
      nameId: nameText.id,
      descriptionId: descriptionText.id,
    }
  }

  public static async updateLocalizedTexts(
    productBaseModel: TextsBaseModel,
    name: {
      en: string | undefined
      es: string | undefined
    },
    description: {
      en: string | undefined
      es: string | undefined
    }
  ) {
    productBaseModel.name.merge(name)
    await productBaseModel.name.save()
    productBaseModel.description.merge(description)
    await productBaseModel.description.save()
  }

  public static async calculateLandingRating(landing: Landing) {
    const reviews = await ProductReview.query().where('landingId', landing.id)
    let total = 0
    let count = 0
    reviews.forEach((review) => {
      total += review.rating
      count++
    })
    const rating = (
      total === 0 && count === 0 ? 0 : NP.round(NP.divide(total, count), 2)
    ).toString()
    landing.merge({
      rating: rating,
      reviewsCount: count,
    })
    await landing.save()

    return {
      rating: rating,
      reviewsCount: count,
    }
  }

  private static async getProductByField(
    field: string,
    value: string | number,
    inventoriesData: boolean,
    adminData: boolean,
    bigbuyData?: boolean
  ) {
    let product: Product | null = null
    product = await Product.query()
      .where(field, value)
      .apply((scopes) => {
        if (inventoriesData) {
          scopes.getInventoriesData()
        }
        if (adminData) {
          scopes.getAdminData()
        }
      })
      .first()
    if (!product) {
      throw new ModelNotFoundException(`Invalid ${field} ${value} getting product`)
    }

    if (adminData && bigbuyData && product.inventories && product.inventories.length > 0) {
      const stocks = await BigbuyService.getProductsStocks(
        product.inventories.map((item) => {
          return item.sku
        })
      )
      for (let i = 0; i < product.inventories.length; i++) {
        const inventory = product.inventories[i]
        let stock = stocks.find((stock) => stock.sku === inventory.sku)
        // const { id, name, description, price } = await BigbuyService.getProductInfo(inventory.sku)
        inventory.bigbuyData = {
          id: '',
          name: '',
          description: '',
          price: 0,
          quantity: stock?.quantity || 0,
        }
        inventory.merge({ quantity: stock?.quantity || 0 })
        await inventory.save()
      }
    }

    return product
  }

  private static async getLandingByField(
    field: string,
    value: string | number,
    productsData?: boolean
  ) {
    let landing: Landing | null = null
    landing = await Landing.query()
      .where(field, value)
      .apply((scopes) => {
        if (productsData) {
          scopes.getProductsData()
        }
      })
      .first()
    if (!landing) {
      throw new ModelNotFoundException(`Invalid ${field} ${value} getting landing`)
    }
    return landing
  }

  private static async getSomeCategoryByField(field: string, value: string | number) {
    let category: ProductCategory | ProductCategoryGroup | null = null
    category = await ProductCategoryGroup.query().where(field, value).preload('categories').first()
    if (!category) {
      category = await ProductCategory.query().where(field, value).first()
    }
    if (!category) {
      throw new ModelNotFoundException(`Invalid ${field} ${value} getting some product category`)
    }
    return category
  }

  private static async getCategoryGroupByField(field: string, value: string | number) {
    let categoryGroup: ProductCategoryGroup | null = null
    categoryGroup = await ProductCategoryGroup.findBy(field, value)
    if (!categoryGroup) {
      throw new ModelNotFoundException(`Invalid ${field} ${value} getting product category group`)
    }
    return categoryGroup
  }

  private static async getCategoryByField(field: string, value: string | number) {
    let category: ProductCategory | null = null
    category = await ProductCategory.findBy(field, value)
    if (!category) {
      throw new ModelNotFoundException(`Invalid ${field} ${value} getting product category`)
    }
    return category
  }

  private static async getInventoryByField(field: string, value: string | number) {
    let inventory: ProductInventory | null = null
    inventory = await ProductInventory.findBy(field, value)
    if (!inventory) {
      throw new ModelNotFoundException(`Invalid ${field} ${value} getting product inventory`)
    }
    return inventory
  }

  private static async getDiscountByField(field: string, value: string | number) {
    let discount: ProductDiscount | null = null
    discount = await ProductDiscount.findBy(field, value)
    if (!discount) {
      throw new ModelNotFoundException(`Invalid ${field} ${value} getting product discount`)
    }
    return discount
  }

  private static async getPackByField(field: string, value: string | number) {
    let pack: ProductPack | null = null
    pack = await ProductPack.findBy(field, value)
    if (!pack) {
      throw new ModelNotFoundException(`Invalid ${field} ${value} getting product pack`)
    }

    return pack
  }

  private static async getReviewByField(
    field: string,
    value: string | number,
    landingData?: boolean
  ) {
    let review: ProductReview | null = null
    review = await ProductReview.query()
      .where(field, value)
      .where((query) => {
        if (landingData) {
          query.preload('landing')
        }
      })
      .first()
    if (!review) {
      throw new ModelNotFoundException(`Invalid ${field} ${value} getting product review`)
    }

    return review
  }
}
