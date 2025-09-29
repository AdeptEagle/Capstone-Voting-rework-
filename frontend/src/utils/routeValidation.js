// Route validation utility to prevent unauthorized access

// Define valid routes for each role
const VALID_ROUTES = {
  SUPERADMIN: [
    '/superadmin',
    '/superadmin/manage-admins',
    '/admin/dashboard',
    '/admin/positions',
    '/admin/candidates',
    '/admin/voters',
    '/admin/voter-history/:voterId',
    '/admin/elections',
    '/admin/election-history',
    '/admin/ballot-management',
    '/admin/ballot-details/:ballotId',
    '/admin/ballot-traceability',
    '/admin/department-management',
    '/trash-bin'
  ],
  ADMIN: [
    '/admin/dashboard',
    '/admin/positions',
    '/admin/candidates',
    '/admin/voters',
    '/admin/voter-history/:voterId',
    '/admin/elections',
    '/admin/election-history',
    '/admin/ballot-management',
    '/admin/ballot-details/:ballotId',
    '/admin/ballot-traceability',
    '/admin/department-management',
    '/trash-bin'
  ],
  USER: [
    '/user/dashboard',
    '/user/vote',
    '/user/candidates',
    '/user/ballot-selection',
    '/user/vote/:ballotId',
    '/user/ballot-results/:ballotId',
    '/user/voting-history'
  ]
};

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/admin',
  '/admin-login',
  '/user-login',
  '/register',
  '/forgot-password',
  '/admin-forgot-password',
  '/reset-password'
];

/**
 * Check if a route is valid for the given role
 * @param {string} pathname - The current pathname
 * @param {string} role - The user's role
 * @returns {boolean} - Whether the route is valid for the role
 */
export function isValidRoute(pathname, role) {
  console.log('isValidRoute called with:', { pathname, role });
  
  // Allow public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    console.log('isValidRoute: Public route, returning true');
    return true;
  }

  // Check if route matches any valid route for the role
  const validRoutes = VALID_ROUTES[role] || [];
  console.log('isValidRoute: Valid routes for role:', validRoutes);
  
  // Check exact match
  if (validRoutes.includes(pathname)) {
    console.log('isValidRoute: Exact match found, returning true');
    return true;
  }

  // Check dynamic routes (e.g., /admin/ballot-details/123)
  for (const route of validRoutes) {
    if (route.includes('/:')) {
      const routePattern = route.replace(/\/:[^/]+/g, '/[^/]+');
      const regex = new RegExp(`^${routePattern}$`);
      console.log('isValidRoute: Testing pattern:', routePattern, 'against:', pathname, 'result:', regex.test(pathname));
      if (regex.test(pathname)) {
        console.log('isValidRoute: Dynamic route match found, returning true');
        return true;
      }
    }
  }

  console.log('isValidRoute: No match found, returning false');
  return false;
}

/**
 * Get the appropriate redirect path for a role
 * @param {string} role - The user's role
 * @returns {string} - The redirect path
 */
export function getDefaultRoute(role) {
  switch (role) {
    case 'SUPERADMIN':
      return '/superadmin';
    case 'ADMIN':
      return '/admin/dashboard';
    case 'USER':
      return '/user/dashboard';
    default:
      return '/user-login';
  }
}

/**
 * Check if a pathname is a valid route pattern
 * @param {string} pathname - The pathname to check
 * @returns {boolean} - Whether it's a valid route pattern
 */
export function isRoutePattern(pathname) {
  console.log('isRoutePattern called with:', pathname);
  
  // Check if it matches any known route patterns
  const routePatterns = [
    /^\/admin\/ballot-details\/[^/]+$/,
    /^\/admin\/voter-history\/[^/]+$/,
    /^\/user\/vote\/[^/]+$/,
    /^\/user\/ballot-results\/[^/]+$/
  ];

  const result = routePatterns.some(pattern => {
    const testResult = pattern.test(pathname);
    console.log('isRoutePattern: Testing pattern:', pattern, 'against:', pathname, 'result:', testResult);
    return testResult;
  });
  
  console.log('isRoutePattern: Final result:', result);
  return result;
}
