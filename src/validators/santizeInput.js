import sanitizeHtml from "sanitize-html";

export function sanitizeRequestBody(req, res, next) {
    for (let key in req.body) {
        if (typeof req.body[key] === "string") {
            req.body[key] = sanitizeHtml(req.body[key], {
                allowedTags: [],
                allowedAttributes: {},
                textFilter: function(text) {
                    return text.trim(); // Remove extra whitespace
                }
            });
        }
    }
    next();
}

