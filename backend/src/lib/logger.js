/* Minimal leveled logger so the output stays readable without another dependency. */
const stamp = () => new Date().toISOString();
export const logger = {
  info: (...a) => console.log(stamp(), 'INFO ', ...a),
  warn: (...a) => console.warn(stamp(), 'WARN ', ...a),
  error: (...a) => console.error(stamp(), 'ERROR', ...a),
};
export default logger;
