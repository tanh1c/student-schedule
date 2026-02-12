# Backend Unit Tests

This directory contains comprehensive unit tests for the MyBK proxy server backend.

## Test Structure

```
tests/
├── setup.js                    # Test setup and configuration
├── utils/                      # Utility function tests
│   ├── AppError.test.js
│   ├── masking.test.js
│   └── validation.test.js
├── middlewares/                # Middleware tests
│   ├── authMiddleware.test.js
│   └── errorMiddleware.test.js
├── services/                   # Service layer tests
│   ├── dataService.test.js
│   └── dkmhParser.test.js
└── controllers/                # Controller tests
    ├── authController.test.js
    └── lecturerController.test.js
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Coverage

The tests cover:

### Utils
- **AppError**: Custom error class with status codes
- **Masking**: Sensitive data masking functions (tokens, cookies, URLs, student IDs)
- **Validation**: Zod schema validation for API inputs

### Middlewares
- **authMiddleware**: Token-based authentication
- **errorMiddleware**: Global error handling and request ID generation

### Services
- **dataService**: Subject and lecturer data management with Vietnamese search
- **dkmhParser**: HTML parsing for course registration system responses

### Controllers
- **authController**: Login, logout, DKMH authentication
- **lecturerController**: Lecturer search, schedule browsing, subject listing

## Writing New Tests

When adding new tests, follow these patterns:

1. **Mock external dependencies**:
```javascript
jest.mock('../../src/services/sessionStore.js');
jest.mock('../../src/utils/logger.js', () => ({
    default: {
        info: jest.fn(),
        error: jest.fn()
    }
}));
```

2. **Setup and teardown**:
```javascript
beforeEach(() => {
    jest.clearAllMocks();
    // Setup test data
});
```

3. **Test structure**:
```javascript
describe('Component Name', () => {
    describe('functionName', () => {
        it('should do something specific', () => {
            // Arrange
            // Act
            // Assert
        });
    });
});
```

## Notes

- Tests use Jest with ES modules support
- Node.js flag `--experimental-vm-modules` is required for ES modules
- Tests are isolated and don't affect the production database
- Mock functions are reset between tests automatically

## Continuous Integration

These tests should be run as part of your CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
- name: Run tests
  run: npm test

- name: Upload coverage
  run: npm run test:coverage
```
