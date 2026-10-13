// True when the request came from an HTML form rather than an API client
function isFormRequest(req) {
  const ct = (req.headers && req.headers['content-type']) || '';
  return ct.includes('application/x-www-form-urlencoded') || ct.includes('multipart/form-data');
}

module.exports = { isFormRequest };
