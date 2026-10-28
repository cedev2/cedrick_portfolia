/**
 * Shared plugin: soft-delete aware helpers.
 * Records are flagged with `deleted_at` instead of being removed, so the
 * public endpoints (`find({ deleted_at: null })`) never expose removed records.
 */
export const softDeletePlugin = (schema) => {
  schema.statics.alive = function alive(query = {}) {
    return this.find({ ...query, deleted_at: null });
  };

  schema.pre('find', function preFind(next) {
    if (!this.getOptions().includeDeleted && this.schema.path('deleted_at')) {
      this.where({ deleted_at: null });
    }
    next();
  });
};

/**
 * Shared plugin: index creation on save.
 */
export const autoIndexPlugin = (schema) => {
  schema.pre('save', function preSave(next) {
    this.$locals.skipIndexCheck = true;
    next();
  });
};

export default softDeletePlugin;
