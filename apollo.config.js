module.exports = {
  client: {
    service: {
      name: 'ropescore-api',
      localSchemaFile: './graphql.schema.json'
    },
    includes: ['**/*.gql'],
    excludes: ['**/*.ts', '**/*.js']
  }
}
