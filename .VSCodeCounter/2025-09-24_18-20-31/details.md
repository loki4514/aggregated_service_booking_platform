# Details

Date : 2025-09-24 18:20:31

Directory c:\\Users\\lokes\\Desktop\\aggregated_service_booking_platform\\src

Total : 48 files,  2166 codes, 91 comments, 425 blanks, all 2682 lines

[Summary](results.md) / Details / [Diff Summary](diff.md) / [Diff Details](diff-details.md)

## Files
| filename | language | code | comment | blank | total |
| :--- | :--- | ---: | ---: | ---: | ---: |
| [src/config/constants.js](/src/config/constants.js) | JavaScript | 14 | 2 | 3 | 19 |
| [src/config/database.js](/src/config/database.js) | JavaScript | 11 | 2 | 3 | 16 |
| [src/config/logger.js](/src/config/logger.js) | JavaScript | 18 | 1 | 5 | 24 |
| [src/config/rateLimiter.js](/src/config/rateLimiter.js) | JavaScript | 15 | 1 | 2 | 18 |
| [src/controllers/addon.controller.js](/src/controllers/addon.controller.js) | JavaScript | 22 | 0 | 4 | 26 |
| [src/controllers/auth.controller.js](/src/controllers/auth.controller.js) | JavaScript | 15 | 0 | 4 | 19 |
| [src/controllers/booking.controller.js](/src/controllers/booking.controller.js) | JavaScript | 124 | 1 | 24 | 149 |
| [src/controllers/professional.controller.js](/src/controllers/professional.controller.js) | JavaScript | 48 | 0 | 9 | 57 |
| [src/controllers/service.controller.js](/src/controllers/service.controller.js) | JavaScript | 40 | 0 | 8 | 48 |
| [src/controllers/user.controller.js](/src/controllers/user.controller.js) | JavaScript | 115 | 10 | 27 | 152 |
| [src/errors/customErrors.js](/src/errors/customErrors.js) | JavaScript | 34 | 1 | 8 | 43 |
| [src/middleware/auth.middleware.js](/src/middleware/auth.middleware.js) | JavaScript | 32 | 2 | 13 | 47 |
| [src/middleware/authorizeRole.js](/src/middleware/authorizeRole.js) | JavaScript | 9 | 0 | 4 | 13 |
| [src/middleware/checkUserOwnership.js](/src/middleware/checkUserOwnership.js) | JavaScript | 10 | 0 | 8 | 18 |
| [src/middleware/error.middleware.js](/src/middleware/error.middleware.js) | JavaScript | 17 | 3 | 5 | 25 |
| [src/middleware/validation.middleware.js](/src/middleware/validation.middleware.js) | JavaScript | 35 | 1 | 10 | 46 |
| [src/repository/addon.repository.js](/src/repository/addon.repository.js) | JavaScript | 19 | 0 | 5 | 24 |
| [src/repository/address.repository.js](/src/repository/address.repository.js) | JavaScript | 57 | 1 | 7 | 65 |
| [src/repository/booking.repository.js](/src/repository/booking.repository.js) | JavaScript | 223 | 9 | 29 | 261 |
| [src/repository/bookingAddon.repository.js](/src/repository/bookingAddon.repository.js) | JavaScript | 37 | 1 | 4 | 42 |
| [src/repository/professional.repository.js](/src/repository/professional.repository.js) | JavaScript | 83 | 0 | 11 | 94 |
| [src/repository/professionalService.repository.js](/src/repository/professionalService.repository.js) | JavaScript | 9 | 0 | 2 | 11 |
| [src/repository/professionalServiceAddon.repository.js](/src/repository/professionalServiceAddon.repository.js) | JavaScript | 9 | 0 | 2 | 11 |
| [src/repository/service.repository.js](/src/repository/service.repository.js) | JavaScript | 50 | 0 | 6 | 56 |
| [src/repository/slot.repository.js](/src/repository/slot.repository.js) | JavaScript | 30 | 0 | 4 | 34 |
| [src/repository/user.repository.js](/src/repository/user.repository.js) | JavaScript | 36 | 0 | 7 | 43 |
| [src/routes/addon.routes.js](/src/routes/addon.routes.js) | JavaScript | 8 | 2 | 5 | 15 |
| [src/routes/auth.routes.js](/src/routes/auth.routes.js) | JavaScript | 14 | 0 | 3 | 17 |
| [src/routes/booking.route.js](/src/routes/booking.route.js) | JavaScript | 57 | 7 | 9 | 73 |
| [src/routes/index.js](/src/routes/index.js) | JavaScript | 15 | 1 | 4 | 20 |
| [src/routes/professional.routes.js](/src/routes/professional.routes.js) | JavaScript | 14 | 0 | 3 | 17 |
| [src/routes/service.routes.js](/src/routes/service.routes.js) | JavaScript | 9 | 3 | 5 | 17 |
| [src/routes/user.routes.js](/src/routes/user.routes.js) | JavaScript | 56 | 7 | 13 | 76 |
| [src/services/addon.service.js](/src/services/addon.service.js) | JavaScript | 17 | 0 | 5 | 22 |
| [src/services/auth.service.js](/src/services/auth.service.js) | JavaScript | 32 | 0 | 8 | 40 |
| [src/services/booking.service.js](/src/services/booking.service.js) | JavaScript | 124 | 20 | 35 | 179 |
| [src/services/price.service.js](/src/services/price.service.js) | JavaScript | 47 | 2 | 12 | 61 |
| [src/services/professional.service.js](/src/services/professional.service.js) | JavaScript | 63 | 3 | 12 | 78 |
| [src/services/service.service.js](/src/services/service.service.js) | JavaScript | 20 | 0 | 6 | 26 |
| [src/services/user.service.js](/src/services/user.service.js) | JavaScript | 135 | 7 | 26 | 168 |
| [src/utils/idempotentKey.js](/src/utils/idempotentKey.js) | JavaScript | 5 | 1 | 2 | 8 |
| [src/utils/jwt.js](/src/utils/jwt.js) | JavaScript | 12 | 0 | 3 | 15 |
| [src/utils/password.hash.js](/src/utils/password.hash.js) | JavaScript | 8 | 0 | 3 | 11 |
| [src/validators/auth.validator.js](/src/validators/auth.validator.js) | JavaScript | 11 | 0 | 3 | 14 |
| [src/validators/booking.validator.js](/src/validators/booking.validator.js) | JavaScript | 80 | 0 | 9 | 89 |
| [src/validators/professional.validator.js](/src/validators/professional.validator.js) | JavaScript | 95 | 0 | 13 | 108 |
| [src/validators/santizeInput.js](/src/validators/santizeInput.js) | JavaScript | 15 | 0 | 3 | 18 |
| [src/validators/user.validator.js](/src/validators/user.validator.js) | JavaScript | 217 | 3 | 29 | 249 |

[Summary](results.md) / Details / [Diff Summary](diff.md) / [Diff Details](diff-details.md)