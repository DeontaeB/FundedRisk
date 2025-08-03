# Contributing to FundedSafe

Thank you for your interest in contributing to FundedSafe! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Git
- A code editor (VS Code recommended)

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/fundedsafe.git
   cd fundedsafe
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   # Fill in your development environment variables
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Start development servers**
   ```bash
   # Terminal 1: Next.js frontend
   npm run dev

   # Terminal 2: Express backend
   npm run server:dev
   ```

## 📝 Code Guidelines

### TypeScript
- Use TypeScript for all new code
- Define proper interfaces and types
- Avoid `any` type unless absolutely necessary
- Use strict mode settings

### React/Next.js
- Use functional components with hooks
- Follow the established component structure
- Use proper TypeScript props interfaces
- Implement proper error boundaries
- Use Next.js 13+ app directory patterns

### Backend (Express.js)
- Use middleware for common functionality
- Implement proper error handling
- Validate all inputs
- Use Prisma for database operations
- Follow RESTful API conventions

### Database (Prisma)
- Always create migrations for schema changes
- Include proper indexes for performance
- Use descriptive model and field names
- Add database constraints where appropriate

### Styling (Tailwind CSS)
- Use Tailwind utility classes
- Follow the established design system
- Create reusable component patterns
- Maintain responsive design principles

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Type checking
npm run type-check

# Linting
npm run lint
```

### Testing Guidelines
- Write tests for all new features
- Include both unit and integration tests
- Test error cases and edge conditions
- Mock external dependencies appropriately
- Maintain good test coverage (>80%)

### Test Structure
```typescript
describe('Component/Function Name', () => {
  it('should do something specific', () => {
    // Arrange
    // Act
    // Assert
  })
})
```

## 🎯 Pull Request Process

### Before Submitting
1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the code guidelines
   - Add tests for new functionality
   - Update documentation if needed

3. **Run quality checks**
   ```bash
   npm run lint
   npm run type-check
   npm test
   npm run build
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

### Commit Message Format
Follow conventional commits:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

### Pull Request Template
```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added tests for new functionality
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console errors or warnings
```

## 🐛 Bug Reports

### Before Reporting
1. Check existing issues
2. Reproduce the bug consistently
3. Test on the latest version

### Bug Report Template
```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g. macOS]
- Browser: [e.g. Chrome]
- Version: [e.g. 22]

**Additional context**
Any other context about the problem.
```

## 💡 Feature Requests

### Feature Request Template
```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Other solutions you've considered.

**Additional context**
Any other context or screenshots.
```

## 📁 Project Structure

```
fundedsafe/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── settings/          # Settings pages
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── layout/           # Layout components
│   └── dashboard/        # Dashboard-specific components
├── server/               # Express.js backend
├── prisma/              # Database schema
├── lib/                 # Utility libraries
├── types/               # TypeScript definitions
├── utils/               # Helper functions
├── hooks/               # Custom React hooks
├── contexts/            # React contexts
└── __tests__/           # Test files
```

## 🔒 Security

### Reporting Security Issues
- Do not open public issues for security vulnerabilities
- Email security@fundedsafe.com with details
- We'll respond within 48 hours

### Security Guidelines
- Never commit secrets or API keys
- Validate all user inputs
- Use parameterized queries
- Implement proper authentication
- Follow OWASP security practices

## 🎨 Design System

### UI Components
- Use existing components from `components/ui/`
- Follow established patterns and props
- Maintain consistency with design system
- Document component APIs

### Colors
- Primary: Blue scale (`primary-*`)
- Success: Green (`green-*`)
- Warning: Yellow (`yellow-*`)
- Error: Red (`red-*`)
- Neutral: Gray scale (`gray-*`)

### Typography
- Font family: Inter
- Use Tailwind typography utilities
- Maintain proper heading hierarchy

## 📚 Documentation

### Code Documentation
- Add JSDoc comments for functions
- Document complex business logic
- Include usage examples
- Keep README updated

### API Documentation
- Document all endpoints
- Include request/response examples
- Specify authentication requirements
- Note any breaking changes

## 🚀 Deployment

### Development
- Automatic deployment on PR merge
- Staging environment for testing
- Feature flags for gradual rollouts

### Production
- Manual deployment approval required
- Database migrations run automatically
- Rollback procedures documented

## 📞 Getting Help

### Communication Channels
- GitHub Issues - Bug reports and feature requests
- GitHub Discussions - General questions
- Discord - Real-time chat (coming soon)

### Maintainers
- @username - Project lead
- @username - Backend specialist
- @username - Frontend specialist

## 📄 License

By contributing to FundedSafe, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to FundedSafe! 🚀