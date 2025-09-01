export const en = {
  // Navigation
  nav: {
    dashboard: 'Dashboard',
    orders: 'Orders',
    menu: 'Menu',
    payments: 'Payments',
    team: 'Team',
    settings: 'Settings',
    support: 'Support',
    messages: 'Messages',
    logout: 'Logout',
    tips: 'Tips',
    management: 'Management'
  },

  // Dashboard
  dashboard: {
    title: 'Dashboard',
    welcome: 'Welcome back',
    recentActivity: 'Recent Activity',
    greeting: {
      morning: 'Good morning',
      afternoon: 'Good afternoon',
      evening: 'Good evening'
    },
    
    // Stats
    stats: {
      todayRevenue: "Revenue",
      activeOrders: "Active Orders",
      todayPayments: "Payments",
      averageOrder: "Average Order",
      currency: "€",
      newGuests: "new guests",
      viaSplitty: "Via Splitty",
      distributedTeam: "Distributed to team",
      googleReviews: "Google Reviews",
      reviewsToday: "Reviews Today",
      totalReviews: "Total Reviews",
      averageRating: "Average Rating",
      generatedViaSplitty: "Generated via Splitty",
      stars: "stars"
    },
    reviews: {
      verified: "Verified",
      viewOnGoogle: "View on Google"
    },
    export: {
      pdf: "Export PDF"
    },

    // Charts
    charts: {
      revenueOverview: "Revenue Overview",
      paymentsOverview: "Payments Overview",
      tipsOverview: "Tips Overview",
      lastDays: "Last 7 Days",
      orderVolume: "Order Volume",
      ordersToday: "orders today",
      revenue: "Revenue",
      payments: "Payments",
      tips: "Tips",
      perHour: "Per hour",
      perDay: "Per day",
      perWeek: "Per week",
      perMonth: "Per month"
    },

    // Recent Payments
    recentPayments: {
      title: "Recent Payments",
      viewAll: "View all payments",
      table: "Table",
      amount: "Amount",
      tip: "Tip",
      status: "Status",
      time: "Time",
      actions: "Actions",
      order: "Order",
      payment: "Payment",
      paid: "Paid",
      failed: "Failed",
      pending: "Pending",
      id: "ID"
    },

    // Active Tables
    activeTables: {
      title: "Tables with Outstanding Orders",
      viewAll: "View all tables",
      clickToView: "Click on a table to view order details",
      table: "Table",
      guests: "guests",
      orderStarted: "Order started",
      currentBill: "Current bill",
      actions: "Actions",
      viewOrder: "View Order",
      ago: "ago",
      total: "Total",
      paid: "Paid",
      outstanding: "Outstanding"
    },

    // Quick Actions
    quickActions: {
      title: "Quick Actions",
      createOrder: "New Order",
      createOrderDesc: "Start a new order for a table",
      viewOrders: "View Orders",
      viewOrdersDesc: "View all active and recent orders",
      manageMenu: "Manage Menu",
      manageMenuDesc: "Update menu items and prices",
      teamManagement: "Team Management",
      teamManagementDesc: "Manage team members and roles",
      seeAll: "See All"
    },

    // System Health
    systemHealth: {
      title: "System Health",
      operational: "Operational",
      allSystemsOperational: "All systems operational",
      paymentProcessing: "Payment Processing",
      qrScanning: "QR Code Scanning",
      apiServices: "API Services",
      database: "Database"
    }
  },

  // Order Details
  order: {
    title: 'Order Details',
    backToOrders: 'Back to orders',
    refresh: 'Refresh',
    tableStatus: {
      occupied: 'Table Occupied',
      waiting: 'Table Waiting',
      free: 'Table Free',
      tableOccupied: 'Occupied',
      tableWaiting: 'Waiting',
      tableFree: 'Free'
    },
    table: 'Table',
    orderNumber: 'Order #',
    orderNumberLabel: 'Order Number',
    status: 'Status',
    waiter: 'Waiter',
    guests: 'Guests',
    guestsCount: 'Number of Guests',
    duration: 'Duration',
    tableTime: 'Time at Table',
    startTime: 'Start Time',
    totalAmount: 'Total Amount',
    totalOrder: 'Total Order',
    paidAmount: 'Paid',
    remainingAmount: 'Remaining',
    outstandingAmount: 'Outstanding Amount',
    stillToPay: 'Still to pay',
    tip: 'Tip',
    tipsReceived: 'Tips Received',
    items: 'Items',
    orderedItems: 'Ordered Items',
    quantity: 'Quantity',
    price: 'Price',
    subtotal: 'Subtotal',
    paymentProgress: 'Payment Progress',
    paymentProgressPercent: 'Payment Progress',
    percentComplete: '% complete',
    guestPayments: 'Guest Payments',
    paymentHistory: 'Payment History',
    method: 'Method',
    completed: 'Completed',
    pending: 'Pending',
    failed: 'Failed',
    notes: 'Notes',
    actions: 'Actions',
    sendReminder: 'Send Reminder',
    reminderPayment: 'Remind Payment',
    markPaid: 'Mark as Paid',
    viewPayment: 'View Payment',
    viewDetails: 'View details',
    printReceipt: 'Print Receipt',
    printBill: 'Print Bill',
    downloadInvoice: 'Download Invoice',
    orderOverview: 'Order Overview',
    quickInfo: 'Quick Info',
    splitDetails: 'Split Details',
    activeModes: 'Active Modes',
    totalGuests: 'Total Guests',
    payments: 'Payments',
    paymentsCompleted: 'completed',
    statistics: 'Statistics',
    averagePerGuest: 'Average per guest',
    tipPercentage: 'Tip percentage',
    splittyFees: 'Splitty fees',
    partiallyPaid: 'Partially paid',
    splitModes: {
      items: 'Items Paid',
      equal: 'Split Equally',
      custom: 'Custom',
      whole: 'Whole Bill',
      itemsPaid: 'Paid for bill items',
      equalSplit: 'Bill split equally',
      customAmount: 'Custom amount paid',
      wholeBill: 'Whole bill paid',
      paidForItems: 'Paid for Items',
      splitEqually: 'Split Equally',
      customAmountPaid: 'Custom Amount',
      default: 'Default',
      none: 'No payments yet',
      mixed: 'Mixed payment modes'
    },
    paymentDetails: 'Payment Details',
    paymentMode: 'Payment Mode',
    numberOfPayments: 'Number of Payments',
    numberOfItems: 'Number of items',
    totalBill: 'Total bill',
    shared: 'Shared',
    persons: 'persons',
    insufficientBalance: 'Insufficient balance',
    qrCode: 'QR Code',
    scanForSplitty: 'Scan for Splitty',
    open: 'Open'
  },

  // Payment Details
  payment: {
    title: 'Payment Details',
    backToOverview: 'Back to overview',
    transactionId: 'Transaction',
    paymentId: 'Payment ID',
    orderNumber: 'Order Number',
    table: 'Table',
    amount: 'Amount',
    tip: 'Tip',
    status: 'Status',
    paid: 'Paid',
    failed: 'Failed',
    pending: 'Pending',
    paymentMethod: 'Payment Method',
    paymentProvider: 'Payment Provider',
    processedAt: 'Processed at',
    settlementDate: 'Settlement expected',
    financialOverview: 'Financial Overview',
    orderAmount: 'Order Amount',
    serviceFee: 'Splitty Service Fee',
    paidByCustomer: 'Paid by customer',
    totalCharged: 'Total charged to customer',
    restaurantReceives: 'Restaurant receives',
    includingTip: 'Incl. tip & service fee',
    orderAmountPlusTip: 'Order amount + tip',
    paymentDetails: 'Payment Details',
    splitMode: {
      items: 'Paid for items',
      equal: 'Split equally',
      custom: 'Custom amount',
      whole: 'Paid whole bill'
    },
    splitDetails: {
      paymentMode: 'Payment Mode',
      paidItems: 'Paid Items',
      numberOfItems: 'Number of items',
      totalBill: 'Total bill',
      totalGuests: 'Total guests',
      paidAmount: 'Paid amount',
      remainingAmount: 'Remaining amount',
      yourShare: 'Your share',
      persons: 'persons',
      guestChoseAmount: 'Guest chose to pay a custom amount',
      equallyDivided: 'The total bill was equally divided among',
      completePayment: 'The complete bill was paid at once for the whole group of',
      averagePerGuest: 'Average per guest',
      guestsAtTable: 'Guests at table'
    },
    technicalDetails: 'Technical Details',
    device: 'Device',
    appVersion: 'App Version',
    qrCodeSession: 'QR Code Session',
    ipAddress: 'IP Address',
    actions: 'Actions',
    downloadInvoice: 'Download Invoice',
    requestRefund: 'Request Refund',
    retryPayment: 'Retry Payment',
    viewOrderDetails: 'View Order Details',
    failureReason: 'Failure reason',
    notes: 'Notes',
    viewOrder: 'View Order',
    quickInfo: 'Quick Info',
    systemHealth: 'System Health',
    operational: 'Operational',
    paidItems: 'Paid Items',
    subtotalItems: 'Subtotal items',
    time: 'Time',
    transaction: 'Transaction'
  },

  // Layout
  layout: {
    expand: 'Expand',
    collapse: 'Collapse',
    restaurantAdmin: 'Restaurant Admin',
    roles: {
      manager: 'Restaurant Manager',
      staff: 'Staff Member'
    }
  },

  // Payouts
  payouts: {
    title: 'Payouts',
    subtitle: 'View your payouts and tips distribution',
    exportCSV: 'Export CSV',
    nextPayout: 'Next payout',
    totalPaidOut: 'Total paid out',
    thisMonth: 'This month',
    totalTips: 'Total tips',
    distributedOverTeam: 'Distributed over team',
    bankAccount: 'Bank Account',
    accountNumber: 'Account Number',
    accountHolder: 'Account Holder',
    payoutSchedule: 'Payouts are processed every Tuesday',
    stripeConnectTitle: 'Stripe Connect Payouts',
    stripeConnectDesc: 'Stripe Connect Payouts interface will be loaded here',
    embedCode: 'Embed code',
    productionNote: 'In production, the real Stripe Connect interface will be shown here',
    payoutDetails: 'Payout Details',
    period: 'Period',
    status: 'Status',
    breakdown: 'Breakdown',
    revenue: 'Revenue',
    tips: 'Tips',
    transactionFees: 'Transaction Fees',
    total: 'Total',
    bankDetails: 'Bank Details',
    close: 'Close',
    downloadPDF: 'Download PDF',
    paidOut: 'Paid Out',
    inProgress: 'In Progress',
    failed: 'Failed'
  },

  // Settings
  settings: {
    title: 'Settings',
    subtitle: 'Manage your restaurant settings and preferences',
    tabs: {
      profile: 'My Profile',
      general: 'General',
      payment: 'Payment Settings',
      notifications: 'Notifications',
      pos: 'POS Integration',
      security: 'Security'
    },
    profile: {
      personalInfo: 'Personal Information',
      profilePhoto: 'Profile Photo',
      change: 'Change',
      remove: 'Remove',
      uploadPhoto: 'Upload photo',
      name: 'Name',
      email: 'Email address',
      phone: 'Phone number',
      role: 'Role',
      accountActivity: 'Account Activity',
      accountCreated: 'Account created',
      lastLogin: 'Last login',
      twoFactor: 'Two-factor authentication',
      disabled: 'Disabled',
      enabled: 'Enabled'
    },
    general: {
      branding: 'Restaurant Branding',
      logo: 'Restaurant Logo',
      banner: 'Restaurant Banner',
      changeLogo: 'Change Logo',
      changeBanner: 'Change Banner',
      uploadFile: 'Upload file',
      dragDrop: 'or drag and drop',
      maxSize: 'PNG, JPG up to 10MB',
      recommended: 'Recommended: 1920x400px, PNG or JPG up to 10MB',
      fileTooLarge: 'File is too large. Maximum 10MB allowed.',
      selectImage: 'Select an image file (PNG, JPG, GIF).',
      restaurantInfo: 'Restaurant Information',
      restaurantName: 'Restaurant Name',
      website: 'Website',
      addressInfo: 'Address Information',
      streetNumber: 'Street and Number',
      postalCode: 'Postal Code',
      city: 'City',
      businessInfo: 'Business Information',
      kvkNumber: 'Chamber of Commerce Number',
      vatNumber: 'VAT Number'
    },
    payment: {
      setupComplete: 'Setup complete',
      accountReady: 'Your account is ready to receive payments',
      accountStatus: 'Account Status',
      payments: 'Payments',
      payouts: 'Payouts',
      active: 'Active'
    },
    notifications: {
      preferences: 'Notification Preferences',
      manageHow: 'Manage how and when you receive notifications',
      orders: 'Orders',
      newOrders: 'New orders',
      paymentReceived: 'Payment received',
      reports: 'Reports',
      dailySummary: 'Daily summary',
      weeklyReport: 'Weekly report',
      channels: 'Channels',
      emailNotifications: 'Email notifications',
      emailDesc: 'Receive notifications via email',
      pushNotifications: 'Push notifications',
      pushDesc: 'Browser notifications for urgent updates',
      disableAll: 'Disable all',
      testNotification: 'Send test notification'
    },
    pos: {
      title: 'POS System Integration',
      connectionStatus: 'Connection Status',
      successfullyConnected: 'Your POS system is successfully connected with Splitty',
      connectedSince: 'Connected since',
      viewSettings: 'View settings',
      apiData: 'API Data',
      apiKey: 'API Key',
      restaurantId: 'Restaurant ID',
      lastSync: 'Last sync',
      minutesAgo: 'minutes ago'
    },
    security: {
      title: 'Security & Privacy',
      accountSecured: 'Account is secured',
      twoFactorEnabled: 'Two-factor authentication is enabled',
      password: 'Password',
      changePassword: 'Change password',
      accountRecovery: 'Account Recovery',
      recoveryDesc: 'If you forgot your password, we can send a recovery link to your email address.',
      sendRecoveryLink: 'Send recovery link',
      smsVerification: 'SMS verification',
      active: 'Active',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm New Password',
      passwordChanged: 'Password successfully changed!',
      passwordMismatch: 'Passwords do not match',
      passwordTooShort: 'Password must be at least 8 characters',
      incorrectPassword: 'Current password is incorrect',
      recoverPassword: 'Recover Password',
      yourEmail: 'Your email address',
      recoveryNote: 'We will send a recovery link to this email address',
      recoveryWarning: 'Note: The recovery link is valid for 1 hour. Check your spam folder if you don\'t see the email.',
      recoverySent: 'Recovery link sent to your email address!',
      sending: 'Sending...'
    },
    saveChanges: 'Save changes',
    changesSaved: 'Changes saved',
    cancel: 'Cancel',
    today: 'Today'
  },

  // Team
  team: {
    title: 'Team Management',
    subtitle: 'Manage your restaurant employees and their performance',
    addEmployee: 'Add Employee',
    stats: {
      total: 'Total',
      active: 'Active'
    },
    search: 'Search by name or email...',
    table: {
      employee: 'Employee',
      role: 'Role',
      status: 'Status',
      phone: 'Phone Number',
      email: 'Email',
      actions: 'Actions',
      since: 'Since',
      clickToDeactivate: 'Click to deactivate',
      clickToActivate: 'Click to activate',
      remove: 'Remove'
    },
    roles: {
      manager: 'Manager',
      staff: 'Staff',
      waiter: 'Waiter',
      chef: 'Chef'
    },
    statusBadge: {
      active: 'Active',
      inactive: 'Inactive'
    },
    modals: {
      addMember: {
        title: 'Add Team Member',
        firstName: 'First Name',
        firstNamePlaceholder: 'John',
        lastName: 'Last Name',
        lastNamePlaceholder: 'Doe',
        email: 'Email',
        emailPlaceholder: 'john@restaurant.com',
        phone: 'Phone',
        phonePlaceholder: '+31 6 12345678',
        phoneOptional: '(optional)',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        passwordPlaceholder: 'Min. 8 characters',
        confirmPlaceholder: 'Repeat',
        role: 'Role',
        roleStaff: 'Staff',
        roleManager: 'Manager',
        roleBasic: 'Basic',
        roleFull: 'Full',
        cancel: 'Cancel',
        add: 'Add'
      },
      editMember: {
        title: 'Edit Team Member',
        changePassword: 'Change password',
        save: 'Save'
      },
      changePassword: {
        title: 'Change Password',
        newPassword: 'New Password',
        confirmNewPassword: 'Confirm New Password',
        passwordPlaceholder: '••••••••',
        change: 'Change Password',
        cancel: 'Cancel'
      },
      confirmDelete: {
        title: 'Delete Team Member',
        message: 'Are you sure you want to permanently delete %s? This action cannot be undone.',
        confirm: 'Delete',
        cancel: 'Cancel',
        confirmationPlaceholder: 'Type "%s" to confirm'
      }
    },
    messages: {
      passwordMismatch: 'Passwords do not match!',
      passwordTooShort: 'Password must be at least 8 characters',
      passwordChanged: 'Password successfully changed!',
      memberAdded: 'Team member successfully added!',
      memberUpdated: 'Team member successfully updated!',
      memberDeleted: 'Team member successfully deleted!',
      cannotDeleteSelf: 'You cannot delete yourself!',
      cannotDeleteLastManager: 'You cannot delete the last active manager! There must always be at least one active manager.',
      cannotDeactivateSelf: 'You cannot deactivate your own account!',
      cannotDeactivateLastManager: 'You cannot deactivate the last active manager! There must always be at least one active manager.',
      memberDeleted: '%s has been successfully deleted',
      deleteError: 'An error occurred while deleting the team member',
      memberStatusChanged: '%s has been %s',
      activated: 'activated',
      deactivated: 'deactivated',
      emailExists: 'A team member with this email already exists',
      fillRequiredFields: 'Please fill in all required fields'
    }
  },

  // Support
  support: {
    title: 'Support Chat',
    ticketTitle: 'Support Chat - Ticket',
    directContact: 'Direct contact with Splitty Support',
    online: 'Online',
    offline: 'Offline',
    today: 'Today',
    yesterday: 'Yesterday',
    welcome: 'Welcome to Splitty Support!',
    howCanWeHelp: 'How can we help you?',
    typeMessage: 'Type your message here...',
    send: 'Send',
    supportHours: 'Support is available Monday through Friday, 9:00 AM - 6:00 PM',
    quickResponses: {
      haveQuestion: 'I have a question',
      haveProblem: 'I have a problem',
      somethingElse: 'Something else'
    },
    recentTickets: {
      title: 'Recent Tickets',
      total: 'total',
      status: {
        resolved: 'Resolved',
        open: 'Open',
        inProgress: 'In Progress'
      }
    },
    faq: {
      title: 'Frequently Asked Questions',
      questions: {
        addEmployee: 'How do I add a new employee?',
        splitPayment: 'How does payment splitting work?',
        findInvoices: 'Where can I find my invoices?',
        changeRestaurantInfo: 'How do I change my restaurant information?',
        resetTable: 'How can I reset a table?',
        supportHours: 'What are the support hours?',
        exportData: 'How do I export my data?',
        changePassword: 'How do I change my password?',
        findReports: 'Where can I find reports?',
        activateDiscounts: 'How do I activate discount codes?',
        multipleLocations: 'Can I manage multiple locations?',
        changeMenu: 'How do I change the menu?',
        setOpeningHours: 'How do I set opening hours?',
        seeReviews: 'Where can I see customer reviews?',
        configurePayments: 'How do I configure payment methods?'
      }
    },
    contact: {
      title: 'Contact',
      emailSupport: 'Email support',
      hours: 'Mon-Fri: 9:00 AM - 6:00 PM'
    },
    messages: {
      viewHistory: 'View chat history',
      archivedTicket: 'This is an archived ticket',
      ticketStatus: 'Status',
      reopen: 'Reopen',
      newChat: 'Start new chat',
      endChat: 'End chat',
      thankYouMessage: 'Thank you for your message! One of our support agents will respond as soon as possible.',
      autoCloseWarning: 'This chat will be automatically closed soon due to inactivity.',
      autoClosed: 'This chat has been automatically closed due to inactivity.',
      tellUsMore: 'Tell us how we can help you.',
      askQuestion: 'Of course! Feel free to ask your question. We\'re happy to help.',
      problemResponse: 'I\'m sorry to hear that. What is the problem about?',
      thankYouInfo: 'Thank you for the information. ',
      softwareFrozen: 'For software issues, first try refreshing the page (F5).',
      paymentIssue: 'For payment issues, we need more information.',
      tableIssue: 'For table issues, please provide the table number.',
      tipIssue: 'For tip issues, can you specify which table?',
      qrCodeIssue: 'For QR code issues, please specify which table.',
      loginIssue: 'For login issues, please confirm the email address you\'re using.'
    },
    problemOptions: {
      softwareFrozen: 'The software is frozen / not responding',
      paymentFailed: 'A payment didn\'t go through',
      tableNotShowing: 'A table is not showing',
      tipsIncorrect: 'Tips are not displaying correctly',
      qrCodeIssue: 'I can\'t generate a QR code',
      loginIssue: 'I can\'t log in to the admin panel',
      somethingElse: 'Something else...'
    }
  },

  // Login
  login: {
    title: 'Restaurant Portal',
    subtitle: 'Log in to your restaurant account',
    forOwners: 'For restaurant owners & staff',
    email: 'Email address',
    emailPlaceholder: 'you@restaurant.com',
    password: 'Password',
    passwordPlaceholder: '••••••••',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password?',
    loginButton: 'Log in',
    loggingIn: 'Logging in...',
    copyright: '© 2025 Splitty B.V. All rights reserved.'
  },

  // Forgot Password
  forgotPassword: {
    title: 'Forgot your password?',
    subtitle: 'No problem! Enter your email address and we\'ll send you a link to reset your password.',
    email: 'Email address',
    emailPlaceholder: 'you@restaurant.com',
    sendLink: 'Send recovery link',
    sending: 'Sending...',
    backToLogin: 'Back to login',
    successTitle: 'Check your inbox',
    successMessage: 'We have sent a recovery link to %s if this account exists.',
    checkSpam: 'Also check your spam folder',
    securityNote: 'For security reasons, the recovery link is only valid for 15 minutes. Request a new one if the link has expired.',
    rateLimitError: 'Too many recovery attempts. Please try again in an hour.',
    rateLimitWarning: 'For security, we limit the number of recovery attempts.'
  },

  // Reset Password
  resetPassword: {
    title: 'Set new password',
    subtitle: 'Choose a strong password for your account',
    newPassword: 'New password',
    confirmPassword: 'Confirm password',
    passwordStrength: 'Password strength',
    changeButton: 'Change password',
    changing: 'Changing password...',
    successTitle: 'Password changed!',
    successMessage: 'Your password has been successfully changed. You will be redirected to the login page...',
    passwordMismatch: 'Passwords do not match',
    passwordMatch: 'Passwords match',
    passwordRequirements: 'Password does not meet all requirements',
    linkExpired: 'This link has expired',
    linkExpiredMessage: 'Request a new recovery link to change your password.',
    requestNewLink: 'Request new link',
    error: 'An error occurred. Please try again later.',
    strengthWeak: 'Weak',
    strengthFair: 'Fair',
    strengthGood: 'Good',
    strengthStrong: 'Strong',
    strengthVeryStrong: 'Very strong'
  },

  // Common
  common: {
    loading: "Loading...",
    error: "Error",
    success: "Success",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    view: "View",
    search: "Search",
    filter: "Filter",
    refresh: "Refresh",
    export: "Export",
    import: "Import",
    noData: "No data available",
    confirm: "Confirm",
    back: "Back",
    next: "Next",
    previous: "Previous",
    yes: "Yes",
    no: "No",
    all: "All",
    none: "None",
    select: "Select",
    selected: "Selected",
    total: "Total",
    from: "From",
    to: "To",
    of: "of",
    per: "per",
    page: "Page",
    showing: "Showing",
    entries: "entries"
  },

  // Date Filter
  dateFilter: {
    today: 'Today',
    yesterday: 'Yesterday',
    lastWeek: 'Last week',
    lastMonth: 'Last month',
    lastQuarter: 'Last quarter',
    lastYear: 'Last year',
    weekToDate: 'Week to date',
    monthToDate: 'Month to date',
    quarterToDate: 'Quarter to date',
    yearToDate: 'Year to date',
    customRange: 'Custom range',
    from: 'From',
    to: 'To',
    apply: 'Apply',
    cancel: 'Cancel',
    dateFormat: 'DD-MM-YYYY',
    weekDays: {
      mon: 'Mon',
      tue: 'Tue',
      wed: 'Wed',
      thu: 'Thu',
      fri: 'Fri',
      sat: 'Sat',
      sun: 'Sun'
    },
    months: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
  },

  // Time
  time: {
    today: "Today",
    yesterday: "Yesterday",
    thisWeek: "This Week",
    lastWeek: "Last Week",
    thisMonth: "This Month",
    lastMonth: "Last Month",
    thisYear: "This Year",
    lastYear: "Last Year",
    custom: "Custom",
    seconds: "seconds",
    minutes: "minutes",
    hours: "hours",
    days: "days",
    weeks: "weeks",
    months: "months",
    years: "years",
    ago: "ago",
    weekDaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  },

  // Errors
  errors: {
    pageNotFound: 'Page not found',
    redirectingToDashboard: 'Redirecting you to the dashboard',
    goToDashboard: 'Go to dashboard'
  }
}