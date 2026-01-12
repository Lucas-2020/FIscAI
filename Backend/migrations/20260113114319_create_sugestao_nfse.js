exports.up = async (knex) => {
    await knex.schema.createTable("sugestao_nfse", (t) => {
        t.bigIncrements("id_sugestao_nfse").primary();

        t.bigInteger("id_usuario").notNullable()
            .references("id_usuario").inTable("usuarios")
            .onDelete("CASCADE");

        t.bigInteger("id_empresa").nullable()
            .references("id_empresa").inTable("empresas")
            .onDelete("SET NULL");

        t.text("regime_empresa").notNullable();
        t.string("uf_prestador", 2).notNullable();
        t.text("municipio_prestador").notNullable();
        t.string("uf_tomador", 2).notNullable();
        t.text("municipio_tomador").notNullable();

        t.text("descricao_servico").notNullable();
        t.decimal("valor_servico", 12, 2).notNullable();

        t.boolean("tomador_orgao_publico").notNullable().defaultTo(false);
        t.boolean("tomador_exterior").notNullable().defaultTo(false);

        t.jsonb("retorno_completo").notNullable();
        t.integer("ano").notNullable();

        t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());

        t.index(["id_usuario", "id_sugestao_nfse"], "ix_sugestao_nfse_usuario");
        t.index(["id_empresa"], "ix_sugestao_nfse_empresa");
        t.index(["ano"], "ix_sugestao_nfse_ano");
    });

    await knex.raw(`
    ALTER TABLE sugestao_nfse
    ADD CONSTRAINT ck_sugestao_nfse_ano
    CHECK (ano >= 2000 AND ano <= 2100);
  `);

    await knex.raw(`
    ALTER TABLE sugestao_nfse
    ADD CONSTRAINT ck_sugestao_nfse_valor_nonneg
    CHECK (valor_servico >= 0);
  `);
};

exports.down = async (knex) => {
    await knex.schema.dropTableIfExists("sugestao_nfse");
};