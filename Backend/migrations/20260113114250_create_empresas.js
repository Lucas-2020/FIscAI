exports.up = async (knex) => {
    await knex.schema.createTable("empresas", (t) => {
        t.bigIncrements("id_empresa").primary();

        t.bigInteger("id_usuario").notNullable()
            .references("id_usuario").inTable("usuarios")
            .onDelete("CASCADE");

        t.string("cnpj", 20).notNullable();
        t.text("razao_social").notNullable();
        t.string("uf", 2).notNullable();
        t.text("regime_tributario").notNullable();

        t.boolean("empresa_padrao").notNullable().defaultTo(false);
        t.boolean("status").notNullable().defaultTo(true);

        t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
        t.timestamp("updated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());

        t.index(["id_usuario"], "ix_empresas_id_usuario");
        t.index(["status"], "ix_empresas_status");
        t.index(["uf"], "ix_empresas_uf");
    });

    // Índice único parcial: impede duplicar empresa ativa (mesmo cnpj+uf por usuário)
    await knex.raw(`
    CREATE UNIQUE INDEX IF NOT EXISTS ux_empresas_ativas_por_usuario
    ON empresas (id_usuario, cnpj, uf)
    WHERE status = TRUE;
  `);

    // Índice único parcial: garante só 1 empresa padrão ativa por usuário
    await knex.raw(`
    CREATE UNIQUE INDEX IF NOT EXISTS ux_empresas_padrao_por_usuario
    ON empresas (id_usuario)
    WHERE empresa_padrao = TRUE AND status = TRUE;
  `);
};

exports.down = async (knex) => {
    await knex.schema.dropTableIfExists("empresas");
};