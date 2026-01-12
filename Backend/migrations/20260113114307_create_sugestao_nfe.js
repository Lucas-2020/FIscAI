exports.up = async (knex) => {
    await knex.schema.createTable("sugestao_nfe", (t) => {
        t.bigIncrements("id_sugestao_nfe").primary();

        t.bigInteger("id_usuario").notNullable()
            .references("id_usuario").inTable("usuarios")
            .onDelete("CASCADE");

        t.bigInteger("id_empresa").nullable()
            .references("id_empresa").inTable("empresas")
            .onDelete("SET NULL");

        t.text("regime_empresa").notNullable();
        t.string("uf_emitente", 2).notNullable();
        t.string("uf_destinatario", 2).notNullable();
        t.text("tipo_operacao").notNullable();
        t.text("natureza_operacao").notNullable();
        t.text("finalidade").notNullable();
        t.text("produto").notNullable();
        t.text("regime_produto").notNullable();
        t.boolean("industrializado").notNullable().defaultTo(false);

        t.jsonb("retorno_completo").notNullable();
        t.integer("ano").notNullable();

        t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());

        t.index(["id_usuario", "id_sugestao_nfe"], "ix_sugestao_nfe_usuario");
        t.index(["id_empresa"], "ix_sugestao_nfe_empresa");
        t.index(["ano"], "ix_sugestao_nfe_ano");
    });

    await knex.raw(`
    ALTER TABLE sugestao_nfe
    ADD CONSTRAINT ck_sugestao_nfe_ano
    CHECK (ano >= 2000 AND ano <= 2100);
  `);
};

exports.down = async (knex) => {
    await knex.schema.dropTableIfExists("sugestao_nfe");
};