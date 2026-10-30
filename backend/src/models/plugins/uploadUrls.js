import { publicUrl } from '../../lib/storage.js';

/**
 * Mongoose plugin: when a document is serialised for the API, rewrite stored upload URLs so
 * they load from wherever the API is hosted (see lib/storage.js publicUrl). Older uploads were
 * saved as "/api/uploads/..." which only works when frontend and API share one origin.
 *
 *   schema.plugin(uploadUrls, { fix: (ret, fix) => { ret.image = fix(ret.image); } });
 *
 * Keeps any toJSON transform the schema already had.
 */
export function uploadUrls(schema, { fix }) {
  const prev = schema.get('toJSON') || {};
  schema.set('toJSON', {
    ...prev,
    transform(doc, ret, options) {
      const out = prev.transform ? prev.transform(doc, ret, options) || ret : ret;
      fix(out, publicUrl);
      return out;
    },
  });
}

export const fixList = (list, fix) => (Array.isArray(list) ? list.map(fix) : list);

export default uploadUrls;
