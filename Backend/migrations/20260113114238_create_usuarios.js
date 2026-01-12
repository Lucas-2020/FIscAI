exports.up = async (knex) => {
    await knex.schema.createTable("usuarios", (t) => {
        t.bigIncrements("id_usuario").primary();
        t.text("nome").notNullable();
        t.specificType("email", "citext").notNullable();
        t.string("cpf_cnpj", 20).notNullable();
        t.text("senha").notNullable();

        t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
        t.timestamp("updated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    });

    await knex.schema.alterTable("usuarios", (t) => {
        t.unique(["email"], { indexName: "ux_usuarios_email" });
    });
};

exports.down = async (knex) => {
    await knex.schema.dropTableIfExists("usuarios");
};