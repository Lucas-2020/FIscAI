exports.up = async (knex) => {
    await knex.raw('CREATE EXTENSION IF NOT EXISTS citext;');
};

exports.down = async (knex) => {
    await knex.raw('DROP EXTENSION IF EXISTS citext;');
};