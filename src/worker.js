export default new Worker(new URL('./garanti.js', import.meta.url), {
  type: 'module',
});
