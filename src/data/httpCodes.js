// HTTP Status Codes Reference

export const HTTP_CODES = {
  // 1xx Informational
  100: { status: 'Continue', description: 'Server received the request headers, client should proceed to send the request body.' },
  101: { status: 'Switching Protocols', description: 'Server is switching protocols as requested by the client.' },
  102: { status: 'Processing', description: 'Server has received and is processing the request, but no response is available yet.' },
  103: { status: 'Early Hints', description: 'Used to return some response headers before final HTTP message.' },

  // 2xx Success
  200: { status: 'OK', description: 'Request succeeded. Standard response for successful HTTP requests.' },
  201: { status: 'Created', description: 'Request succeeded and a new resource was created.' },
  202: { status: 'Accepted', description: 'Request accepted for processing, but processing is not complete.' },
  203: { status: 'Non-Authoritative Information', description: 'Request succeeded but returned info may be from another source.' },
  204: { status: 'No Content', description: 'Request succeeded but there is no content to send in the response.' },
  205: { status: 'Reset Content', description: 'Request succeeded, client should reset the document view.' },
  206: { status: 'Partial Content', description: 'Server is delivering only part of the resource due to a range header.' },
  207: { status: 'Multi-Status', description: 'Response provides status for multiple independent operations.' },
  208: { status: 'Already Reported', description: 'Members of a DAV binding have already been enumerated.' },
  226: { status: 'IM Used', description: 'Server has fulfilled a GET request with instance-manipulations applied.' },

  // 3xx Redirection
  300: { status: 'Multiple Choices', description: 'Request has multiple possible responses. Client should choose one.' },
  301: { status: 'Moved Permanently', description: 'Resource has been permanently moved to a new URL.' },
  302: { status: 'Found', description: 'Resource temporarily resides at a different URL.' },
  303: { status: 'See Other', description: 'Client should GET a different URI using GET method.' },
  304: { status: 'Not Modified', description: 'Resource has not been modified since last request.' },
  305: { status: 'Use Proxy', description: 'Requested resource must be accessed through the proxy.' },
  307: { status: 'Temporary Redirect', description: 'Resource temporarily at a different URI, use same method.' },
  308: { status: 'Permanent Redirect', description: 'Resource permanently at a different URI, use same method.' },

  // 4xx Client Errors
  400: { status: 'Bad Request', description: 'Server cannot process the request due to client error (e.g., malformed syntax).' },
  401: { status: 'Unauthorized', description: 'Authentication is required and has failed or has not been provided.' },
  402: { status: 'Payment Required', description: 'Reserved for future use. Originally intended for digital payment systems.' },
  403: { status: 'Forbidden', description: 'Server understood the request but refuses to authorize it.' },
  404: { status: 'Not Found', description: 'Requested resource could not be found on the server.' },
  405: { status: 'Method Not Allowed', description: 'Request method is known but not supported for the target resource.' },
  406: { status: 'Not Acceptable', description: 'Server cannot produce a response matching the acceptable values.' },
  407: { status: 'Proxy Authentication Required', description: 'Client must first authenticate itself with the proxy.' },
  408: { status: 'Request Timeout', description: 'Server timed out waiting for the request.' },
  409: { status: 'Conflict', description: 'Request conflicts with current state of the target resource.' },
  410: { status: 'Gone', description: 'Resource is no longer available and will not be available again.' },
  411: { status: 'Length Required', description: 'Server requires Content-Length header to be specified.' },
  412: { status: 'Precondition Failed', description: 'One or more conditions in request headers evaluated to false.' },
  413: { status: 'Payload Too Large', description: 'Request entity is larger than limits defined by server.' },
  414: { status: 'URI Too Long', description: 'URI provided was too long for the server to process.' },
  415: { status: 'Unsupported Media Type', description: 'Media format of requested data is not supported by server.' },
  416: { status: 'Range Not Satisfiable', description: 'Range specified by Range header cannot be fulfilled.' },
  417: { status: 'Expectation Failed', description: 'Server cannot meet the requirements of the Expect header.' },
  418: { status: "I'm a teapot", description: 'Server refuses to brew coffee because it is, permanently, a teapot.' },
  421: { status: 'Misdirected Request', description: 'Request was directed at a server that is not able to produce a response.' },
  422: { status: 'Unprocessable Entity', description: 'Request was well-formed but contained semantic errors.' },
  423: { status: 'Locked', description: 'Resource that is being accessed is locked.' },
  424: { status: 'Failed Dependency', description: 'Request failed due to failure of a previous request.' },
  425: { status: 'Too Early', description: 'Server is unwilling to risk processing a request that might be replayed.' },
  426: { status: 'Upgrade Required', description: 'Server refuses to perform the request using current protocol.' },
  428: { status: 'Precondition Required', description: 'Origin server requires the request to be conditional.' },
  429: { status: 'Too Many Requests', description: 'User has sent too many requests in a given amount of time.' },
  431: { status: 'Request Header Fields Too Large', description: 'Server unwilling to process request due to large headers.' },
  451: { status: 'Unavailable For Legal Reasons', description: 'Resource unavailable due to legal demands.' },

  // 5xx Server Errors
  500: { status: 'Internal Server Error', description: 'Server encountered an unexpected condition that prevented it from fulfilling the request.' },
  501: { status: 'Not Implemented', description: 'Server does not support the functionality required to fulfill the request.' },
  502: { status: 'Bad Gateway', description: 'Server acting as gateway received an invalid response from upstream server.' },
  503: { status: 'Service Unavailable', description: 'Server is currently unable to handle the request due to overload or maintenance.' },
  504: { status: 'Gateway Timeout', description: 'Server acting as gateway did not receive a timely response from upstream server.' },
  505: { status: 'HTTP Version Not Supported', description: 'Server does not support the HTTP protocol version used in the request.' },
  506: { status: 'Variant Also Negotiates', description: 'Server has an internal configuration error.' },
  507: { status: 'Insufficient Storage', description: 'Server is unable to store the representation needed to complete the request.' },
  508: { status: 'Loop Detected', description: 'Server detected an infinite loop while processing the request.' },
  510: { status: 'Not Extended', description: 'Further extensions to the request are required for the server to fulfill it.' },
  511: { status: 'Network Authentication Required', description: 'Client needs to authenticate to gain network access.' },
};

// Get HTTP code info
export function getHttpCode(code) {
  const numCode = parseInt(code, 10);
  return HTTP_CODES[numCode] || null;
}

// Get category for HTTP code
export function getHttpCategory(code) {
  const numCode = parseInt(code, 10);
  if (numCode >= 100 && numCode < 200) return 'Informational';
  if (numCode >= 200 && numCode < 300) return 'Success';
  if (numCode >= 300 && numCode < 400) return 'Redirection';
  if (numCode >= 400 && numCode < 500) return 'Client Error';
  if (numCode >= 500 && numCode < 600) return 'Server Error';
  return 'Unknown';
}

// Get common HTTP codes
export function getCommonHttpCodes() {
  return [200, 201, 204, 301, 302, 304, 400, 401, 403, 404, 405, 500, 502, 503, 504];
}
