import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'product_packs_inventories'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('pack_id')
        .unsigned()
        .references('id')
        .inTable('product_packs')
        .onDelete('CASCADE')
      table
        .integer('inventory_id')
        .unsigned()
        .references('id')
        .inTable('product_inventories')
        .onDelete('CASCADE')

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
