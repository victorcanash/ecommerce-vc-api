import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'product_discounts'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .integer('product_id')
        .unsigned()
        .references('id')
        .inTable('products')
        .onDelete('CASCADE')
      table
        .integer('name_id')
        .unsigned()
        .references('id')
        .inTable('localized_texts')
        .onDelete('CASCADE')
      table
        .integer('description_id')
        .unsigned()
        .references('id')
        .inTable('localized_texts')
        .onDelete('CASCADE')
      table.float('discount_percent', 255).notNullable()
      table.boolean('active').defaultTo(true).notNullable()

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
